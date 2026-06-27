import type { FileSystemObjectDto } from "@/api/generated/model";
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
}: Props) => {
  const { currentPath, navigating } = useFileBrowser();

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
        {objects.map((obj) => (
          <li key={`${obj.type ?? "UNKNOWN"}:${obj.name}`}>
            <FileBrowserRow
              obj={obj}
              loading={effectiveLoading}
              canWrite={canWrite}
              onEntryClick={effectiveEntryClick}
              onRename={navigating ? undefined : onRename}
              onDelete={navigating ? undefined : onDelete}
              onDownload={navigating ? undefined : onDownload}
              onEdit={navigating ? undefined : onEdit}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
