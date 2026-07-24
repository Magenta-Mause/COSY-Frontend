import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/Icon.tsx";
import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole, type UserEntityDtoRole as UserRole } from "@/api/generated/model";
import filterIcon from "@/assets/icons/filter.webp";

interface RoleFilterProps {
  selectedRole: UserRole | null;
  onRoleChange: (role: UserRole | null) => void;
}

const RoleFilter = ({ selectedRole, onRoleChange }: RoleFilterProps) => {
  const { t } = useTranslation();

  const roles: UserRole[] = [
    UserEntityDtoRole.OWNER,
    UserEntityDtoRole.ADMIN,
    UserEntityDtoRole.QUOTA_USER,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="z-10">
          <Icon src={filterIcon} className="size-5" />
          {selectedRole
            ? t(`components.userManagement.userRow.roles.${selectedRole.toLowerCase()}` as ParseKeys<"translation">)
            : t("components.userManagement.userTable.filter")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {roles.map((role) => (
            <DropdownMenuItem key={role} onClick={() => onRoleChange(role)}>
              {t(`components.userManagement.userRow.roles.${role.toLowerCase()}` as ParseKeys<"translation">)}
            </DropdownMenuItem>
          ))}

          {selectedRole && (
            <>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRoleChange(null)}
              >
                {t("components.userManagement.userTable.resetFilter")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleFilter;
