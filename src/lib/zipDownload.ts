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
): Promise<void> {
  const cd = response.headers.get("Content-Disposition");
  const match = cd?.match(/filename="([^"]+)"/);
  const filename = match
    ? match[1]
    : `${baseNameFromPath(startPath)}-part-${chunkIndex + 1}-of-${totalChunks}.zip`;

  const blob = await response.blob();
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
  onProgress?: (chunkDone: number, totalChunks: number) => void;
}): Promise<void> {
  const { serverUuid, startPath, chunkSizeMb, onProgress } = opts;
  const token = getAuthToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const params0 = new URLSearchParams({
    path: startPath,
    chunkIndex: "0",
    chunkSizeMb: String(chunkSizeMb),
  });
  const response0 = await fetch(
    `/api/game-server/${serverUuid}/file-system/download-as-zip-chunk?${params0}`,
    { headers },
  );
  if (!response0.ok) {
    throw new Error(`Chunk download failed with status ${response0.status}`);
  }

  const totalChunksHeader = response0.headers.get("X-Total-Chunks");
  const totalChunks = totalChunksHeader ? parseInt(totalChunksHeader, 10) : 1;

  onProgress?.(0, totalChunks);
  await downloadChunkAsBlob(response0, 0, totalChunks, startPath);
  onProgress?.(1, totalChunks);

  for (let i = 1; i < totalChunks; i++) {
    const params = new URLSearchParams({
      path: startPath,
      chunkIndex: String(i),
      chunkSizeMb: String(chunkSizeMb),
    });
    const response = await fetch(
      `/api/game-server/${serverUuid}/file-system/download-as-zip-chunk?${params}`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(`Chunk ${i} download failed with status ${response.status}`);
    }
    await downloadChunkAsBlob(response, i, totalChunks, startPath);
    onProgress?.(i + 1, totalChunks);
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
