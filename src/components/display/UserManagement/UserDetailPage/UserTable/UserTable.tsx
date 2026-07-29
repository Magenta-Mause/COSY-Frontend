import type { ParseKeys } from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole, type UserEntityDtoRole as UserRole } from "@/api/generated/model";
import searchIcon from "@/assets/icons/search.webp";
import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/stores/hooks.ts";
import UserInviteButton from "../../UserInvite/UserInviteButton";
import PendingInvitesList from "./PendingInvitesList";
import RoleFilter from "./RoleFilter";
import SortDropdown, { type SortField } from "./SortDropdown";
import UserRow from "./UserRow";

interface UserListProps {
  onRevoke: (uuid: string) => void;
}

const UserTable = ({ onRevoke }: UserListProps) => {
  const users = useAppSelector((state) => state.userSliceReducer.data);
  const invites = useAppSelector((state) => state.userInviteSliceReducer.data);
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [isAsc, setIsAsc] = useState(true);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      const nameMatch = user.username?.toLowerCase().includes(term);
      const roleMatch = selectedRole ? user.role === selectedRole : true;
      return nameMatch && roleMatch;
    });
  }, [users, searchTerm, selectedRole]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortField) {
        let valueA: string | number | null | undefined;
        let valueB: string | number | null | undefined;

        if (sortField === "docker_max_cpu_cores" || sortField === "docker_memory_limit") {
          valueA = a.docker_hardware_limits?.[sortField];
          valueB = b.docker_hardware_limits?.[sortField];
        } else {
          valueA = a[sortField];
          valueB = b[sortField];
        }

        if (
          typeof valueA === "number" ||
          typeof valueB === "number" ||
          valueA === null ||
          valueB === null
        ) {
          const numA = valueA === null ? Number.POSITIVE_INFINITY : (valueA as number);
          const numB = valueB === null ? Number.POSITIVE_INFINITY : (valueB as number);

          return isAsc ? numA - numB : numB - numA;
        }

        const strA = String(valueA ?? "").toLowerCase();
        const strB = String(valueB ?? "").toLowerCase();
        return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      const roleOrder: Record<UserRole, number> = {
        [UserEntityDtoRole.OWNER]: 1,
        [UserEntityDtoRole.ADMIN]: 2,
        [UserEntityDtoRole.QUOTA_USER]: 3,
      };

      const roleA = roleOrder[a.role ?? UserEntityDtoRole.QUOTA_USER];
      const roleB = roleOrder[b.role ?? UserEntityDtoRole.QUOTA_USER];

      return roleA - roleB;
    });
  }, [filteredUsers, sortField, isAsc]);

  return (
    <div className="p-4 w-full">
      <div className="text-base mx-auto flex flex-col gap-2">
        <div className="flex flex-row gap-3 justify-between items-center w-full">
          <div className="flex flex-row items-center gap-3">
            <Input
              startDecorator={<Icon src={searchIcon} className="size-6" variant="foreground" />}
              className="h-10 border-2"
              placeholder={t("components.userManagement.userTable.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            <SortDropdown
              sortField={sortField}
              isAscending={isAsc}
              onSortFieldChange={setSortField}
              onSortDirectionToggle={() => setIsAsc(!isAsc)}
            />
          </div>
          <UserInviteButton />
        </div>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user, index) => (
            <UserRow
              key={user.uuid || index}
              user={user}
              userName={user.username ?? "Unknown"}
              userRole={user.role ?? UserEntityDtoRole.QUOTA_USER}
            />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            {t("components.userManagement.userTable.noUsersFound")}{" "}
            {selectedRole
              ? `for role ${t(`components.userManagement.userRow.roles.${selectedRole.toLowerCase()}` as ParseKeys<"translation">)}`
              : ""}
          </div>
        )}
        {users.length > 0 && invites.length > 0 && <Separator className="my-4 pb-0.5" />}

        {invites.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("userModal.pendingInvites")}
            </h4>
            {invites.map((invite, index) => (
              <PendingInvitesList onRevoke={onRevoke} invite={invite} key={invite.uuid || index} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default UserTable;
