import { Checkbox } from "@/components/ui/checkbox.tsx";
import type { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import { GameServerAccessGroupDtoPermissionsItem as PermissionEnum } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils.ts";

type Props = {
  localPermissions: GameServerAccessGroupDtoPermissionsItem[];
  handleTogglePermission: (permission: GameServerAccessGroupDtoPermissionsItem) => void;
  loading: boolean;
  isAdminChecked: boolean;
};

const PermissionsSection = ({
  localPermissions,
  handleTogglePermission,
  loading,
  isAdminChecked,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("permissions")}</h3>
      <div className="flex flex-col gap-3">
        {Object.values(PermissionEnum).map((permission) => {
          const isChecked = localPermissions.includes(permission);

          // Admin disables all others
          const disabledByAdmin = isAdminChecked && permission !== PermissionEnum.ADMIN;

          // SEE_SERVER must be enabled for all others (except ADMIN and SEE_SERVER itself)
          const needsSeeServer =
            permission !== PermissionEnum.ADMIN &&
            permission !== PermissionEnum.SEE_SERVER &&
            !localPermissions.includes(PermissionEnum.SEE_SERVER);

          const isDisabled = loading || disabledByAdmin || needsSeeServer;

          // Dangerous permissions get red styling
          const isDangerous =
            permission === PermissionEnum.DELETE_SERVER ||
            permission === PermissionEnum.TRANSFER_SERVER_OWNERSHIP;

          const permissionKey = permission as keyof typeof PermissionEnum;
          const permissionName = t(`permissionDescriptions.${permissionKey}.name`);
          const permissionDescription = t(`permissionDescriptions.${permissionKey}.description`);

          return (
            // biome-ignore lint/a11y/useSemanticElements: Checkbox wrapper needs to be clickable
            <div
              key={permission}
              className={cn(
                "cursor-pointer flex flex-col gap-0 align-middle select-none grow-0 w-fit ml-3",
                isDisabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => !isDisabled && handleTogglePermission(permission)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                  e.preventDefault();
                  handleTogglePermission(permission);
                }
              }}
              tabIndex={0}
              role={"button"}
            >
              <div className={"flex align-middle items-center gap-3"}>
                <Checkbox
                  checked={isChecked}
                  className="size-4"
                  disabled={isDisabled}
                  tabIndex={-1}
                />
                <span className={cn("text-sm font-medium", isDangerous && "text-destructive")}>
                  {permissionName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground ml-8">{permissionDescription}</p>
            </div>
          );
        })}
      </div>
      {isAdminChecked && <p className="text-xs text-muted-foreground">{t("adminNote")}</p>}
      {!isAdminChecked && !localPermissions.includes(PermissionEnum.SEE_SERVER) && (
        <p className="text-xs text-muted-foreground">{t("seeServerNote")}</p>
      )}
    </div>
  );
};

export default PermissionsSection;
