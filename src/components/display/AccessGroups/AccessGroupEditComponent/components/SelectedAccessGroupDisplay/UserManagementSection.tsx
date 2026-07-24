import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import Icon from "@/components/ui/Icon.tsx";
import * as z from "zod";
import type { UserEntityDto } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

type Props = {
  localUsers: UserEntityDto[];
  usernameInput: string;
  setUsernameInput: (username: string) => void;
  usernameError: string | null;
  setUsernameError: (error: string | null) => void;
  handleAddUser: () => void;
  handleRemoveUser: (userUuid: string) => void;
  loading: boolean;
};

const UserManagementSection = ({
  localUsers,
  usernameInput,
  setUsernameInput,
  usernameError,
  setUsernameError,
  handleAddUser,
  handleRemoveUser,
  loading,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("members")}</h3>

      {/* User List */}
      <div className="flex flex-col gap-2">
        {localUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noUsersAssigned")}</p>
        ) : (
          localUsers.map((user) => (
            <div
              key={user.uuid}
              className="flex items-center justify-between bg-button-primary-default/20 px-2 pr-4 py-0.5 rounded-md leading-none"
            >
              <span className="text-sm">{user.username}</span>
              <button
                type="button"
                onClick={() => user.uuid && handleRemoveUser(user.uuid)}
                disabled={loading}
                className="text-button-primary-active hover:text-button-primary-active/60 disabled:opacity-50"
              >
                <Icon src={closeIcon} variant="foreground" className="size-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add User Input */}
      <InputFieldEditGameServer
        label={t("addUserLabel")}
        value={usernameInput}
        onChange={(v) => {
          setUsernameInput(v as string);
          setUsernameError(null);
        }}
        validator={z.string().min(1)}
        placeholder={t("addUserPlaceholder")}
        errorLabel={usernameError || t("addUserError")}
        disabled={loading}
        optional={true}
        onEnterPress={handleAddUser}
        submitButtonLabel={t("addUserButton")}
        onSubmit={handleAddUser}
        submitDisabled={loading || !usernameInput.trim()}
      />
    </div>
  );
};

export default UserManagementSection;
