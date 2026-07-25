import type { ReactNode } from "react";
import { useMemo } from "react";
import { useReadFileFromVolume } from "@/api/generated/backend-api";
import { FileBrowserPreviewContent } from "../FileBrowserPreviewContent";

interface UseFilePreviewNodeArgs {
  serverUuid: string;
  selectedFileName: string;
  selectedFilePath?: string | null;
  closePreview: () => void;
}

/** Fetches the selected file and builds the memoized preview node for the browser context. */
export const useFilePreviewNode = ({
  serverUuid,
  selectedFileName,
  selectedFilePath,
  closePreview,
}: UseFilePreviewNodeArgs): ReactNode => {
  const readParams = selectedFilePath
    ? { path: selectedFilePath === "/" ? "" : selectedFilePath }
    : null;

  const fileQuery = useReadFileFromVolume(serverUuid, readParams ?? { path: "" }, {
    query: {
      enabled: !!readParams,
      staleTime: 30_000,
    },
  });

  return useMemo(
    () => (
      <FileBrowserPreviewContent
        selectedFileName={selectedFileName}
        selectedFilePath={selectedFilePath}
        onClose={closePreview}
        blob={(fileQuery.data as Blob) ?? null}
        loading={fileQuery.isLoading}
        error={fileQuery.error}
      />
    ),
    [
      selectedFileName,
      selectedFilePath,
      closePreview,
      fileQuery.data,
      fileQuery.isLoading,
      fileQuery.error,
    ],
  );
};
