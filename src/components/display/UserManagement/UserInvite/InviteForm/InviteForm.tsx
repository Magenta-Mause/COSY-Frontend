import { CpuLimitInput } from "@components/display/CpuLimit/CpuLimitInput.tsx";
import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { Label } from "@radix-ui/react-label";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";

interface InviteFormProps {
  username: string;
  memory: string | null;
  cpu: number | null;
  userRole: UserEntityDtoRole;
  canCreateGameServers: boolean;
  onUsernameChange: (value: string) => void;
  onUserRoleChange: (value: UserEntityDtoRole) => void;
  onMemoryChange: (value: string | null) => void;
  onCpuChange: (value: number | null) => void;
  onCanCreateGameServersChange: (value: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
  usernameError?: string | null;
  cpuError?: string | null;
  memoryError?: string | null;
}

export const InviteForm = ({
  username,
  userRole,
  memory,
  cpu,
  canCreateGameServers,
  onUsernameChange,
  onMemoryChange,
  onCpuChange,
  onSubmit,
  onUserRoleChange,
  onCanCreateGameServersChange,
  usernameError,
  cpuError,
  memoryError,
}: InviteFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="space-y-2">
        <div className="flex flex-row gap-5 justify-between">
          <div className="flex-1">
            <Input
              header={t("userModal.usernameLabel")}
              description={t("userModal.usernameDescription")}
              id="invite-username"
              placeholder={t("userModal.usernamePlaceholder")}
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit();
                }
              }}
              error={usernameError}
            />
          </div>
          <div className="flex flex-col justify-start ">
            <Label className="font-bold text-sm pb-2 leading-5.5" htmlFor="invite-role">
              {t("userModal.roleLabel")}
            </Label>
            <Select defaultValue={userRole} onValueChange={onUserRoleChange}>
              <SelectTrigger id={"invite-role"} className="py-1 text-base w-23.75">
                <SelectValue placeholder={t("userModal.rolePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(UserEntityDtoRole)
                  .filter((role) => role !== UserEntityDtoRole.OWNER)
                  .map((role) => (
                    <SelectItem value={role} key={role}>
                      {t(`userRoles.${role}`)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {userRole !== UserEntityDtoRole.OWNER && (
          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="invite-can-create-game-servers"
              checked={userRole !== UserEntityDtoRole.QUOTA_USER || canCreateGameServers}
              disabled={userRole !== UserEntityDtoRole.QUOTA_USER}
              onCheckedChange={(checked) => onCanCreateGameServersChange(checked === true)}
            />
            <Label
              htmlFor="invite-can-create-game-servers"
              className="text-sm font-medium cursor-pointer"
            >
              {t("userModal.canCreateGameServers")}
              {userRole !== UserEntityDtoRole.QUOTA_USER && (
                <span className="text-muted-foreground font-normal ml-1">
                  ({t("userModal.canCreateGameServersAdminHint")})
                </span>
              )}
            </Label>
          </div>
        )}
        <div className="flex justify-between gap-5">
          <div className="w-[45%]">
            <CpuLimitInput
              header={t("userModal.cpuLimit")}
              description={t("userModal.cpuDescription")}
              id="cpu-limit"
              placeholder={t("userModal.placeholder")}
              value={cpu}
              onChange={(val) => onCpuChange(val === "" ? null : Number(val))}
              className="no-spinner"
              error={cpuError || undefined}
            />
          </div>
          <div className="w-[50%]">
            <MemoryLimitInput
              id="memory-limit"
              header={t("userModal.memoryLimit")}
              description={t("userModal.memoryDescription")}
              placeholder={t("userModal.placeholder")}
              value={memory}
              onChange={(val) => onMemoryChange(val === "" ? null : val)}
              className="no-spinner"
              error={memoryError || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
