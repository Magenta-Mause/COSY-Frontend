import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import closeIcon from "@/assets/icons/close.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { FilePreview } from "../FilePreview/FilePreview";

interface FileBrowserPreviewContentProps {
  readonly selectedFileName: string;
  readonly selectedFilePath?: string | null;
  readonly onClose: () => void;
  readonly blob: Blob | null;
  readonly loading: boolean;
  readonly error: unknown;
}

export const FileBrowserPreviewContent = ({
  selectedFileName,
  selectedFilePath,
  onClose,
  blob,
  loading,
  error,
}: FileBrowserPreviewContentProps) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserDialog");

  return (
    <div className="min-w-0 h-full flex flex-col overflow-hidden">
      <div className="px-2 py-2 border-b border-b-border flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm truncate">{selectedFileName || "Preview"}</div>
          {selectedFilePath ? (
            <TooltipWrapper tooltip={selectedFilePath}>
              <div className="text-xs text-muted-foreground truncate">{selectedFilePath}</div>
            </TooltipWrapper>
          ) : null}
        </div>

        <TooltipWrapper tooltip={t("closePreview")}>
          <Button size="icon" onClick={onClose} aria-label={t("closePreview")}>
            <Icon src={closeIcon} className="size-4" />
          </Button>
        </TooltipWrapper>
      </div>

      <FilePreview fileName={selectedFileName} blob={blob} loading={loading} error={error} />
    </div>
  );
};
