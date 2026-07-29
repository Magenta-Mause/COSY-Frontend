import arrowRightIcon from "@/assets/icons/arrowRight.webp";
import houseIcon from "@/assets/icons/house.webp";
import plusIcon from "@/assets/icons/plus.webp";
import reloadIcon from "@/assets/icons/reload.webp";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";

type Crumb = { label: string; path: string };

type Props = {
  crumbs: Crumb[];
  loading?: boolean;

  canWrite: boolean;
  canMkdir: boolean;

  onHome: () => void;
  onCrumbClick: (path: string) => void;

  onRefresh?: () => void;
  onNewFolder?: () => void;
};

export const FileBrowserHeader = ({
  crumbs,
  loading,
  canWrite,
  canMkdir,
  onHome,
  onCrumbClick,
  onRefresh,
  onNewFolder,
}: Props) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserHeader");

  return (
    <div className="border-b border-b-border px-3 py-2 flex items-center gap-1 text-sm text-muted-foreground">
      <button type="button" className="flex items-center gap-1 hover:underline" onClick={onHome}>
        <Icon src={houseIcon} variant="foreground" className="size-4" />
        <span className={cn(crumbs.length === 0 && "text-foreground font-medium")}>HOME</span>
      </button>

      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1 min-w-0">
          <Icon src={arrowRightIcon} variant="foreground" className="size-4" />
          <TooltipWrapper tooltip={c.path}>
            <button
              type="button"
              className={cn(
                "truncate hover:underline",
                i === crumbs.length - 1 && "text-foreground font-medium",
              )}
              onClick={() => onCrumbClick(c.path)}
            >
              {c.label}
            </button>
          </TooltipWrapper>
        </span>
      ))}

      <span className="ml-auto flex items-center gap-2 text-foreground">
        {canWrite && canMkdir ? (
          <TooltipWrapper tooltip={t("newFolder")}>
            <button
              type="button"
              data-testid="files-new-folder-btn"
              onClick={onNewFolder}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1",
                "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
              disabled={loading}
            >
              <Icon src={plusIcon} variant="foreground" className="size-4" />
              <span className="hidden sm:inline">{t("newFolder")}</span>
            </button>
          </TooltipWrapper>
        ) : null}

        <TooltipWrapper tooltip={t("refresh")}>
          <button
            type="button"
            onClick={onRefresh}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1",
              "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
            aria-label={t("refresh")}
            disabled={loading}
          >
            <Icon
              src={reloadIcon}
              variant="foreground"
              className={cn("size-4", loading && "animate-spin")}
            />
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>
        </TooltipWrapper>
      </span>
    </div>
  );
};
