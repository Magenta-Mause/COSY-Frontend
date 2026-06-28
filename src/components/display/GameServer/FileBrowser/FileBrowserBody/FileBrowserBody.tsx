import type { FileSystemObjectDto } from "@/api/generated/model";
import { useMemo } from "react";
import { joinRemotePath } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import { useFileBrowser } from "../FileBrowserContext";
import { FileBrowserRow } from "../FileBrowserRow/FileBrowserRow";

type Props = {
  loading?: boolean;
  error?: string | null;
  emptyText: string;

  objects: FileSystemObjectDto[];
  canWrite: boolean;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
  onEdit?: (obj: FileSystemObjectDto) => void;
  onChangePermissions?: (obj: FileSystemObjectDto) => void;
};

export const FileBrowserBody = ({
  loading,
  error,
  objects,
  emptyText,
  canWrite,
  onEntryClick,
  onRename,
  onDelete,
  onDownload,
  onEdit,
  onChangePermissions,
}: Props) => {
  const { currentPath, navigating, volumes } = useFileBrowser();

  const volumeUuidByPath = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of volumes ?? []) {
      if (v.container_path && v.uuid) {
        map.set(v.container_path.replace(/\/+$/, ""), v.uuid);
      }
    }
    return map;
  }, [volumes]);

  if (error) return <div className="p-3 text-sm text-destructive">{error}</div>;
  if (objects.length === 0 && !loading && currentPath === "/")
    return <div className="p-3 text-sm text-muted-foreground">{emptyText}</div>;

  const effectiveEntryClick = navigating ? undefined : onEntryClick;
  const effectiveLoading = loading || navigating;

  return (
    <div
      className={cn("flex-1 scroller", navigating && "opacity-50 transition-opacity")}
      data-loading={navigating || undefined}
    >
      <ul className="p-2">
        {currentPath !== "/" && (
          <li>
            <FileBrowserRow
              obj={{ name: "..", type: "DIRECTORY" }}
              loading={navigating}
              canWrite={false}
              onEntryClick={effectiveEntryClick}
            />
          </li>
        )}
        {objects.map((obj) => {
          const fullPath = joinRemotePath(currentPath, obj.name);
          const volumeUuid = obj.type === "DIRECTORY" ? volumeUuidByPath.get(fullPath) : undefined;
          return (
            <li key={`${obj.type ?? "UNKNOWN"}:${obj.name}`}>
              <FileBrowserRow
                obj={obj}
                loading={effectiveLoading}
                canWrite={canWrite}
                volumeUuid={volumeUuid}
                onEntryClick={effectiveEntryClick}
                onRename={navigating ? undefined : onRename}
                onDelete={navigating ? undefined : onDelete}
                onDownload={navigating ? undefined : onDownload}
                onEdit={navigating ? undefined : onEdit}
                onChangePermissions={navigating ? undefined : onChangePermissions}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
