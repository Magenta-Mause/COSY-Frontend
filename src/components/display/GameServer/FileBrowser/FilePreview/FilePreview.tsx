import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { blobToTextIfLikely, getExt, IMAGE_EXTS, VIDEO_EXTS } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type FilePreviewProps = {
  fileName: string;
  blob: Blob | null;
  loading?: boolean;
  error?: unknown;
};

async function loadTextPreview(
  blob: Blob,
  isCancelled: () => boolean,
  onSuccess: (text: string) => void,
  onError: (reason: string) => void,
  t: TFunction<"translation", "components.fileBrowser.filePreview">,
) {
  try {
    const res = await blobToTextIfLikely(blob);
    if (isCancelled()) return;

    if (res.ok) onSuccess(res.text);
    else onError(res.reason);
  } catch {
    if (!isCancelled()) onError(t("previewFailure"));
  }
}

export function FilePreview(props: FilePreviewProps) {
  const ext = useMemo(() => getExt(props.fileName), [props.fileName]);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<{ text: string } | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.filePreview");

  useEffect(() => {
    setTextPreview(null);
    setTextError(null);

    if (!props.blob) {
      setObjectUrl(null);
      return;
    }

    const isImage = IMAGE_EXTS.has(ext);
    const isVideo = VIDEO_EXTS.has(ext);

    if (isImage || isVideo) {
      const url = URL.createObjectURL(props.blob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    let cancelled = false;

    loadTextPreview(
      props.blob,
      () => cancelled,
      (text) => setTextPreview({ text }),
      (reason) => setTextError(reason),
      t,
    );

    return () => {
      cancelled = true;
      setObjectUrl(null);
    };
  }, [props.blob, ext, t]);

  if (props.loading) {
    return <div className="p-3 text-sm text-muted-foreground">{t("loadingPreview")}</div>;
  }

  if (props.error) {
    return <div className="p-3 text-sm text-destructive">{t("previewFailure")}</div>;
  }

  if (!props.blob) {
    return <div className="p-3 text-sm text-muted-foreground">{t("selectPreview")}</div>;
  }

  if (objectUrl && IMAGE_EXTS.has(ext)) {
    return (
      <div className="p-2 scroller">
        <img
          src={objectUrl}
          alt={props.fileName}
          className="max-w-full h-auto rounded-md border border-border"
        />
      </div>
    );
  }

  if (objectUrl && VIDEO_EXTS.has(ext)) {
    return (
      <div className="p-2 scroller">
        {/** biome-ignore lint/a11y/useMediaCaption: no captions for arbitrary media files from volumes */}
        <video src={objectUrl} controls className="w-full rounded-md border border-border" />
      </div>
    );
  }

  if (textPreview) {
    return (
      <div className="p-2 flex-1 flex flex-col scroller h-full">
        <pre
          className={cn(
            "text-xs whitespace-pre-wrap wrap-break-words",
            "rounded-md border border-border bg-background p-3",
            "flex-1 min-h-0 scroller",
          )}
        >
          {textPreview.text}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-3 text-sm text-muted-foreground">
      {t("noPreviewAvailable", { textError: textError ? ` (${textError})` : "" })}
    </div>
  );
}
