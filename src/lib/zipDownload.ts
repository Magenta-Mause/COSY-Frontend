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
  const reader = response.body!.getReader();
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
  const reader = response.body!.getReader();
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
