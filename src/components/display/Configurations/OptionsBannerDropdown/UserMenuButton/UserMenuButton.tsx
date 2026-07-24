import { UserProfileModal } from "@/components/display/UserManagement/UserProfileModal/UserProfileModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import userIcon from "@/assets/icons/user.webp";
import { cn } from "@/lib/utils.ts";

type UserMenuButtonProps = ComponentProps<typeof Button>;

const UserMenuButton = forwardRef<HTMLButtonElement, UserMenuButtonProps>(
  ({ onClick, ...props }, ref) => {
    const [isUserOpen, setIsUserOpen] = useState(false);
    const { t } = useTranslationPrefix("optionsBanner");

    return (
      <>
        <Button
          {...props}
          ref={ref}
          onClick={(event) => {
            onClick?.(event);
            setIsUserOpen((prev) => !prev);
          }}
          className={cn("h-auto aspect-square", props.className)}
          aria-label={t("userMenu")}
        >
          <Icon src={userIcon} />
        </Button>
        <UserProfileModal open={isUserOpen} onOpenChange={setIsUserOpen} />
      </>
    );
  },
);

UserMenuButton.displayName = "UserMenuButton";

export default UserMenuButton;
