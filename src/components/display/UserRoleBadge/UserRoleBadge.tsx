import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import { cn } from "@/lib/utils";

interface UserRoleBadgeProps {
  role: UserEntityDtoRole;
  className?: string;
}

const USER_COLORS: Record<UserEntityDtoRole, string> = {
  [UserEntityDtoRole.OWNER]: "bg-[#0eaf9b]",
  [UserEntityDtoRole.ADMIN]: "bg-[#8ff8e2]",
  [UserEntityDtoRole.QUOTA_USER]: "bg-white",
};

const UserRoleBadge = ({ role, className }: UserRoleBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge className={cn("rounded-xl text-sm px-3 uppercase", USER_COLORS[role], className)}>
      {t(`components.userManagement.userRow.roles.${role.toLowerCase()}`)}
    </Badge>
  );
};

export default UserRoleBadge;
