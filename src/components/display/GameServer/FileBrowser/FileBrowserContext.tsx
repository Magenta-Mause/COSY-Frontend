import { createContext, useContext, useMemo } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";

export type FileBrowserActions = {
  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onCrumbClick?: (path: string) => void;
  onRefresh?: () => void;

  onClosePreview?: () => void;

  onMkdir?: (args: { parentPath: string; name: string }) => Promise<unknown> | undefined;
  onRename?: (args: {
    parentPath: string;
    oldName: string;
    newName: string;
    obj: FileSystemObjectDto;
  }) => Promise<unknown>;
  onDelete?: (args: {
    parentPath: string;
    name: string;
    obj: FileSystemObjectDto;
  }) => Promise<unknown>;

  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
  onEditFile?: (obj: FileSystemObjectDto) => void;
};

export type FileBrowserState = {
  currentPath: string;
  objects: FileSystemObjectDto[];

  loading?: boolean;
  error?: string | null;

  fetchDepth: number;

  preview?: React.ReactNode;
  showPreview?: boolean;
  previewedPath?: string | null;

  readOnly?: boolean;
  isSynthetic: boolean;
  navigating?: boolean;

  downloadingFiles: string[];
  downloadProgress?: { done: number; total: number } | null;
};

export type FileBrowserContextValue = FileBrowserState & FileBrowserActions;

const FileBrowserContext = createContext<FileBrowserContextValue | null>(null);

export function FileBrowserProvider(props: {
  value: FileBrowserContextValue;
  children: React.ReactNode;
}) {
  const memoed = useMemo(() => props.value, [props.value]);
  return <FileBrowserContext.Provider value={memoed}>{props.children}</FileBrowserContext.Provider>;
}

export function useFileBrowser() {
  const ctx = useContext(FileBrowserContext);
  if (!ctx) {
    throw new Error("useFileBrowser must be used within a FileBrowserProvider");
  }
  return ctx;
}
