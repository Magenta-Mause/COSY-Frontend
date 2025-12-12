import { Button } from "@components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InviteResultProps {
  generatedKey: string | null;
  onCopyLink: () => void;
  onBack: () => void;
}

export const InviteResult = ({ generatedKey, onCopyLink }: InviteResultProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <div className="bg-muted p-4 rounded-lg break-all text-center font-mono text-xl font-bold border-2 border-dashed border-primary/20 tracking-widest">
          {generatedKey}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-xs text-center text-muted-foreground break-all font-mono px-2 cursor-pointer hover:text-foreground transition-colors focus:outline-none focus:underline bg-transparent border-none p-0"
              onClick={onCopyLink}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCopyLink();
                }
              }}
            >
              {generatedKey ? `${window.location.origin}/?inviteToken=${generatedKey}` : ""}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("userModal.copyTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {t("userModal.shareInstructions")}
      </p>
      <div className="flex flex-col gap-2 mt-2">
        <Button variant="default" size="sm" className="w-full" onClick={onCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          {t("userModal.copyLink")}
        </Button>
      </div>
    </div>
  );
};
