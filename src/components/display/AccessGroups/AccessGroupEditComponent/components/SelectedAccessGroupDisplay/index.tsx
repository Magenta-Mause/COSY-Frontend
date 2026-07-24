import { Card } from "@/components/ui/card.tsx";
import UnsavedModal from "@/components/ui/UnsavedModal.tsx";
import { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import { getUUIDByUsername } from "@/api/generated/backend-api.ts";
import type {
  GameServerAccessGroupDto,
  GameServerAccessGroupDtoPermissionsItem,
  UserEntityDto,
} from "@/api/generated/model";
import { GameServerAccessGroupDtoPermissionsItem as PermissionEnum } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import ActionButtons from "./ActionButtons";
import GroupNameSection from "./GroupNameSection";
import PermissionsSection from "./PermissionsSection";
import UserManagementSection from "./UserManagementSection";

type Props = {
  accessGroup: GameServerAccessGroupDto;
  onChangeStatusUpdate: (hasChanges: boolean) => void;
};

const SelectedAccessGroupDisplay = ({ accessGroup, onChangeStatusUpdate }: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");
  const { deleteGameServerAccessGroup, updateGameServerAccessGroups } = useDataInteractions();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // User management state
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<UserEntityDto[]>([]);

  // Group name state
  const [localGroupName, setLocalGroupName] = useState("");

  // Permissions state
  const [localPermissions, setLocalPermissions] = useState<
    GameServerAccessGroupDtoPermissionsItem[]
  >([]);

  // Initialize state from props
  useEffect(() => {
    setLocalUsers(accessGroup.users);
    setLocalPermissions(accessGroup.permissions);
    setLocalGroupName(accessGroup.group_name);
    setUsernameInput("");
    setUsernameError(null);
  }, [accessGroup]);

  // Check if ADMIN permission is enabled
  const isAdminChecked = useMemo(
    () => localPermissions.includes(PermissionEnum.ADMIN),
    [localPermissions],
  );

  // Validate all fields
  const allFieldsValid = useMemo(() => {
    return z.string().min(1).safeParse(localGroupName).success;
  }, [localGroupName]);

  // Detect changes
  const isChanged = useMemo(() => {
    const nameChanged = localGroupName !== accessGroup.group_name;

    const usersChanged =
      localUsers.length !== accessGroup.users.length ||
      !localUsers.every((user) => accessGroup.users.some((u) => u.uuid === user.uuid));

    const permissionsChanged =
      localPermissions.length !== accessGroup.permissions.length ||
      !localPermissions.every((perm) => accessGroup.permissions.includes(perm));

    return nameChanged || usersChanged || permissionsChanged;
  }, [
    localGroupName,
    localUsers,
    localPermissions,
    accessGroup.group_name,
    accessGroup.users,
    accessGroup.permissions,
  ]);

  // Notify parent when change status updates
  useEffect(() => {
    onChangeStatusUpdate(isChanged);
  }, [isChanged, onChangeStatusUpdate]);

  // Add user by username
  const handleAddUser = async () => {
    if (!usernameInput.trim()) return;

    setUsernameError(null);
    try {
      const userUuid = await getUUIDByUsername(usernameInput.trim());

      // Check if user already exists
      if (localUsers.some((u) => u.uuid === userUuid)) {
        setUsernameError(t("userAlreadyInGroup"));
        return;
      }

      // Add user to local state
      setLocalUsers((prev) => [...prev, { uuid: userUuid, username: usernameInput.trim() }]);
      setUsernameInput("");
    } catch (_error) {
      setUsernameError(t("usernameNotFound"));
    }
  };

  // Remove user
  const handleRemoveUser = (userUuid: string) => {
    setLocalUsers((prev) => prev.filter((u) => u.uuid !== userUuid));
  };

  // Toggle permission
  const handleTogglePermission = (permission: GameServerAccessGroupDtoPermissionsItem) => {
    setLocalPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      }
      return [...prev, permission];
    });
  };

  // Confirm changes
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateGameServerAccessGroups(accessGroup.game_server_uuid, accessGroup.uuid, {
        access_group_name: localGroupName,
        user_uuids: localUsers.map((u) => u.uuid ?? "").filter(Boolean),
        permissions: localPermissions,
      });
    } finally {
      setLoading(false);
    }
  };

  // Revert changes
  const handleRevert = () => {
    setLocalUsers(accessGroup.users);
    setLocalPermissions(accessGroup.permissions);
    setLocalGroupName(accessGroup.group_name);
    setUsernameInput("");
    setUsernameError(null);
  };

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteGameServerAccessGroup(accessGroup.game_server_uuid, accessGroup.uuid);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative p-3 gap-5 flex flex-col mt-5 mb-5 pb-0">
      <div>
        <h2 className="text-lg font-semibold">{t("groupSettings")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-col gap-6">
        <GroupNameSection
          localGroupName={localGroupName}
          setLocalGroupName={setLocalGroupName}
          loading={loading}
          isConfirmButtonDisabled={isConfirmButtonDisabled}
          handleConfirm={handleConfirm}
        />

        <UserManagementSection
          localUsers={localUsers}
          usernameInput={usernameInput}
          setUsernameInput={setUsernameInput}
          usernameError={usernameError}
          setUsernameError={setUsernameError}
          handleAddUser={handleAddUser}
          handleRemoveUser={handleRemoveUser}
          loading={loading}
        />

        <PermissionsSection
          localPermissions={localPermissions}
          handleTogglePermission={handleTogglePermission}
          loading={loading}
          isAdminChecked={isAdminChecked}
        />
      </div>
      <ActionButtons
        loading={loading}
        isChanged={isChanged}
        isConfirmButtonDisabled={isConfirmButtonDisabled}
        handleConfirm={handleConfirm}
        handleRevert={handleRevert}
        handleDelete={handleDelete}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        accessGroupName={accessGroup.group_name}
      />
      <UnsavedModal isChanged={isChanged} onSave={handleConfirm} />
    </Card>
  );
};

export default SelectedAccessGroupDisplay;
