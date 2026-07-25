import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import checkCircleIcon from "@/assets/icons/checkCircle.webp";
import copyIcon from "@/assets/icons/copy.webp";

interface InviteResultProps {
  generatedKey: string | null;
  onCopyLink: () => void;
}

export const InviteResult = ({ generatedKey, onCopyLink }: InviteResultProps) => {
  const { t } = useTranslationPrefix("userModal");
  const inviteLink = generatedKey ? `${window.location.origin}/?inviteToken=${generatedKey}` : "";

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <Icon src={checkCircleIcon} className="size-12 text-accent" />
      <p className="text-sm text-center text-muted-foreground">
        {t("shareInstructions")}
      </p>
      <div className="w-full rounded-lg border-2 border-border bg-background/50 px-4 py-3 text-sm break-all text-center text-muted-foreground select-all cursor-text">
        {inviteLink}
      </div>

      <Button onClick={onCopyLink} className="w-full">
        <Icon src={copyIcon} className="size-5 mr-2" />
        {t("copyLink")}
      </Button>
    </div>
  );
};
