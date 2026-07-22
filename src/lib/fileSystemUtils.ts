import { FILE_TRANSFER_OPTIONS } from "@/api/axiosInstance";
import { readFileFromVolume } from "@/api/generated/backend-api";
import type { FileSystemObjectDto } from "@/api/generated/model";

export function stripLeadingSlash(p: string) {
  return p.startsWith("/") ? p.slice(1) : p;
}

export function normalizePath(p: string) {
  if (!p || p === "") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  if (out.length > 1) out = out.replace(/\/+$/, "");
  return out;
}

export function joinRemotePath(dir: string, fileName: string) {
  const d = normalizePath(dir);
  if (d === "/") return `/${fileName}`;
  return `${d}/${fileName}`;
}

export function joinDir(base: string, name: string) {
  const b = normalizePath(base);
  if (name === "..") {
    if (b === "/") return "/";
    const parts = b.split("/").filter(Boolean);
    parts.pop();
    return `/${parts.join("/")}`;
  }

  if (b === "/") return `/${name}`;
  return `${b}/${name}`;
}

export function baseNameFromPath(p: string) {
  const norm = normalizePath(p);
  if (norm === "/") return "download";
  const parts = norm.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "download";
}

export function splitPath(path: string) {
  if (!path || path === "/") return [];
  return path.split("/").filter(Boolean);
}

export function buildPathCrumbs(currentPath: string) {
  const segs = splitPath(currentPath);
  const crumbs: Array<{ label: string; path: string }> = [];
  let acc = "";
  for (const seg of segs) {
    acc += `/${seg}`;
    crumbs.push({ label: seg, path: acc });
  }
  return crumbs;
}

export function formatUnixPerms(mode?: number) {
  if (mode == null) return { rwx: "---------", octal: "---" };

  const m = mode & 0o7777;
  const permBits = m & 0o777;

  const triples = [(permBits >> 6) & 7, (permBits >> 3) & 7, permBits & 7];
  const rwxTriple = (n: number) => `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;

  let rwx = triples.map(rwxTriple).join("");

  const suid = (m & 0o4000) !== 0;
  const sgid = (m & 0o2000) !== 0;
  const sticky = (m & 0o1000) !== 0;

  if (suid) rwx = rwx.substring(0, 2) + (rwx[2] === "x" ? "s" : "S") + rwx.substring(3);
  if (sgid) rwx = rwx.substring(0, 5) + (rwx[5] === "x" ? "s" : "S") + rwx.substring(6);
  if (sticky) rwx = rwx.substring(0, 8) + (rwx[8] === "x" ? "t" : "T");

  const octal = (m & 0o777).toString(8).padStart(3, "0");
  return { rwx, octal };
}

export function isDirectory(obj: FileSystemObjectDto) {
  return obj.type === "DIRECTORY";
}

export function sortDirsFirst(a: FileSystemObjectDto, b: FileSystemObjectDto) {
  const ad = isDirectory(a);
  const bd = isDirectory(b);
  if (ad !== bd) return ad ? -1 : 1;
  return a.name.localeCompare(b.name);
}

export function validateName(name: string) {
  const n = name.trim();
  if (!n) return "Name is required.";
  if (n === "." || n === "..") return "Invalid name.";
  if (n.includes("/")) return "Name must not include '/'.";
  return null;
}

export const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);
export const VIDEO_EXTS = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);

export const TEXT_EDITABLE_EXTS = new Set([
  // Config / properties
  "properties", "cfg", "conf", "config", "ini", "toml", "env",
  // Markup / data
  "json", "yaml", "yml", "xml", "txt", "md", "csv",
  // Scripts
  "sh", "bash",
  // Logs (usually append-only but still editable)
  "log",
]);
export const TEXT_EDITABLE_MAX_BYTES = 512 * 1024; // 512 KB

export function isTextEditable(obj: FileSystemObjectDto): boolean {
  if (obj.type !== "FILE") return false;
  if ((obj.size ?? 0) > TEXT_EDITABLE_MAX_BYTES) return false;
  return TEXT_EDITABLE_EXTS.has(getExt(obj.name));
}

export function getExt(name: string) {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i + 1).toLowerCase();
}

function isLikelyText(bytes: Uint8Array) {
  let printable = 0;
  let other = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0) return false;

    const isWhitespace = b === 9 || b === 10 || b === 13 || b === 32;
    const isPrintableAscii = b >= 32 && b <= 126;

    if (isWhitespace || isPrintableAscii) printable++;
    else other++;
  }

  const total = printable + other;
  if (total === 0) return true;

  return printable / total >= 0.9;
}

export async function blobToTextIfLikely(blob: Blob) {
  if (blob.size > 16 * 1024) return { ok: false as const, reason: "File is larger than 16KB" };

  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);

  if (!isLikelyText(bytes)) {
    return { ok: false as const, reason: "Content doesn't look like plain text" };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return { ok: true as const, text };
}

function filenameFromPath(path: string) {
  return baseNameFromPath(path) || "download";
}

export async function downloadSingleFile(opts: {
  serverUuid: string;
  parentPath: string;
  name: string;
}) {
  const { serverUuid, parentPath, name } = opts;

  const fullPath = joinRemotePath(parentPath, name);
  const apiPath = fullPath === "/" ? "" : fullPath;

  const blob = (await readFileFromVolume(serverUuid, { path: apiPath }, FILE_TRANSFER_OPTIONS)) as Blob;

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);

  a.href = url;
  a.download = filenameFromPath(fullPath);
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "—";
  if (!Number.isFinite(bytes)) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;

  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }

  const decimals = i === 0 ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(decimals)} ${units[i]}`;
}
