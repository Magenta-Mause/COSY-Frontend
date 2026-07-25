import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import type { ComponentProps } from "react";
import { forwardRef, useContext, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import logoutIcon from "@/assets/icons/logout.webp";
import { cn } from "@/lib/utils.ts";
import { LogOutAlertDialog } from "./LogOutAlertDialog.tsx";

type LogOutButtonProps = ComponentProps<typeof Button>;

const LogOutButton = forwardRef<HTMLButtonElement, LogOutButtonProps>(
  ({ onClick, ...props }, ref) => {
    const { t } = useTranslationPrefix("optionsBanner");
    const { handleLogout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button
          {...props}
          ref={ref}
          className={cn("h-auto aspect-square", props.className)}
          data-testid="logout-btn"
          aria-label={t("logout")}
          onClick={(event) => {
            onClick?.(event);
            setOpen(true);
          }}
        >
          <Icon src={logoutIcon} />
        </Button>
        <LogOutAlertDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} />
      </>
    );
  },
);

LogOutButton.displayName = "LogOutButton";

export default LogOutButton;
