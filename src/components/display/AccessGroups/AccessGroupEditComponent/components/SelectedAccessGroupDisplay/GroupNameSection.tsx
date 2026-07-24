import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

type Props = {
  localGroupName: string;
  setLocalGroupName: (name: string) => void;
  loading: boolean;
  isConfirmButtonDisabled: boolean;
  handleConfirm: () => void;
};

const GroupNameSection = ({
  localGroupName,
  setLocalGroupName,
  loading,
  isConfirmButtonDisabled,
  handleConfirm,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
    <div className="flex flex-col gap-3">
      <InputFieldEditGameServer
        label={t("groupNameLabel")}
        value={localGroupName}
        onChange={(v) => setLocalGroupName(v as string)}
        validator={z.string().min(1)}
        placeholder={t("groupNamePlaceholder")}
        errorLabel={t("groupNameRequired")}
        disabled={loading}
        onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
      />
    </div>
  );
};

export default GroupNameSection;
