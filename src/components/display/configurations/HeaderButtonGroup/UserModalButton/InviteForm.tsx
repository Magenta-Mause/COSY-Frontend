import { Input } from "@components/ui/input.tsx";
import { useTranslation } from "react-i18next";

interface InviteFormProps {
  username: string;
  onUsernameChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const InviteForm = ({ username, onUsernameChange, onSubmit }: InviteFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="invite-username">
          {t("userModal.usernameLabel")}
        </label>
        <Input
          id="invite-username"
          placeholder={t("userModal.usernamePlaceholder")}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">{t("userModal.usernameDescription")}</p>
      </div>
    </div>
  );
};
