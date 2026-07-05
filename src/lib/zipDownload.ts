import { getAuthToken } from "@/api/axiosInstance";
import { baseNameFromPath } from "./fileSystemUtils";

export type DownloadProgressCallback = (done: number) => void;

const supportsFilePicker =
  typeof window !== "undefined" && "showSaveFilePicker" in window;

export { supportsFilePicker };

async function streamToFilePicker(
  response: Response,
  filename: string,
  onProgress?: DownloadProgressCallback,
): Promise<void> {
  // showSaveFilePicker opens a native save dialog — user chooses location.
  // Data is piped chunk-by-chunk directly to disk with no in-memory accumulation.
  const fileHandle = await (
    window as typeof window & {
      showSaveFilePicker: (opts: { suggestedName: string }) => Promise<FileSystemFileHandle>;
    }
  ).showSaveFilePicker({ suggestedName: filename });

  const writable = await fileHandle.createWritable();
  if (!response.body) { await writable.close(); return; }
  const reader = response.body.getReader();
  let done = 0;

  try {
    while (true) {
      const { value, done: isDone } = await reader.read();
      if (isDone) break;
      await writable.write(value);
      done += value.length;
      onProgress?.(done);
    }
  } finally {
    await writable.close();
  }
}

async function streamToBlobFallback(
  response: Response,
  filename: string,
  onProgress?: DownloadProgressCallback,
): Promise<void> {
  // Firefox fallback: accumulate chunks in memory then trigger <a> download.
  // Still OOMs for very large files — warn the user before calling this.
  if (!response.body) return;
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let done = 0;

  while (true) {
    const { value, done: isDone } = await reader.read();
    if (isDone) break;
    chunks.push(value as Uint8Array<ArrayBuffer>);
    done += value.length;
    onProgress?.(done);
  }

  const blob = new Blob(chunks, { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadChunkAsBlob(
  response: Response,
  chunkIndex: number,
  totalChunks: number,
  startPath: string,
  onChunkBytes?: (deltaBytes: number) => void,
): Promise<void> {
  const cd = response.headers.get("Content-Disposition");
  const match = cd?.match(/filename="([^"]+)"/);
  const filename = match
    ? match[1]
    : `${baseNameFromPath(startPath)}-part-${chunkIndex + 1}-of-${totalChunks}.zip`;

  let blob: Blob;
  if (response.body && onChunkBytes) {
    // Stream the part so byte-level progress is reported as data arrives, instead of blocking
    // on response.blob() which emits nothing until the whole part is buffered.
    const reader = response.body.getReader();
    const parts: Uint8Array<ArrayBuffer>[] = [];
    while (true) {
      const { value, done: isDone } = await reader.read();
      if (isDone) break;
      parts.push(value as Uint8Array<ArrayBuffer>);
      onChunkBytes(value.length);
    }
    blob = new Blob(parts, { type: "application/zip" });
  } else {
    blob = await response.blob();
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function zipAndDownloadChunked(opts: {
  serverUuid: string;
  startPath: string;
  chunkSizeMb: number;
  onProgress?: (bytesDone: number, bytesTotal: number) => void;
}): Promise<void> {
  const { serverUuid, startPath, chunkSizeMb, onProgress } = opts;
  const token = getAuthToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const chunkSizeBytes = chunkSizeMb * 1024 * 1024;

  const fetchChunk = async (index: number): Promise<Response> => {
    const params = new URLSearchParams({
      path: startPath,
      chunkIndex: String(index),
      chunkSizeMb: String(chunkSizeMb),
    });
    const response = await fetch(
      `/api/game-server/${serverUuid}/file-system/download-as-zip-chunk?${params}`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(`Chunk ${index} download failed with status ${response.status}`);
    }
    return response;
  };

  const response0 = await fetchChunk(0);
  const totalChunksHeader = response0.headers.get("X-Total-Chunks");
  const totalChunks = totalChunksHeader ? parseInt(totalChunksHeader, 10) : 1;

  // Report real cumulative downloaded bytes. The total is refined per part from its
  // Content-Length (exact where present); parts not yet started are estimated at the chunk size,
  // so the total is exact by the final, longest-tail part and never undershoots what's downloaded.
  let downloadedBytes = 0;
  let accountedBytes = 0;
  let chunksStarted = 0;

  const expectedSize = (response: Response): number => {
    const len = response.headers.get("Content-Length");
    const n = len ? parseInt(len, 10) : Number.NaN;
    return Number.isFinite(n) && n >= 0 ? n : chunkSizeBytes;
  };

  const report = () => {
    const remaining = Math.max(0, totalChunks - chunksStarted);
    onProgress?.(downloadedBytes, accountedBytes + remaining * chunkSizeBytes);
  };

  const handleChunk = async (response: Response, index: number) => {
    accountedBytes += expectedSize(response);
    chunksStarted += 1;
    report();
    await downloadChunkAsBlob(response, index, totalChunks, startPath, (delta) => {
      downloadedBytes += delta;
      report();
    });
  };

  onProgress?.(0, totalChunks * chunkSizeBytes);
  await handleChunk(response0, 0);
  for (let i = 1; i < totalChunks; i++) {
    await handleChunk(await fetchChunk(i), i);
  }
}

export async function zipAndDownload(opts: {
  serverUuid: string;
  startPath: string;
  onProgress?: DownloadProgressCallback;
}): Promise<void> {
  const { serverUuid, startPath, onProgress } = opts;

  const token = getAuthToken();
  const params = new URLSearchParams({ path: startPath });
  const filename = `${baseNameFromPath(startPath)}.zip`;

  const response = await fetch(
    `/api/game-server/${serverUuid}/file-system/download-as-zip?${params}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  if (supportsFilePicker) {
    await streamToFilePicker(response, filename, onProgress);
  } else {
    await streamToBlobFallback(response, filename, onProgress);
  }
}
