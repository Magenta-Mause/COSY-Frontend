import Icon from "@/components/ui/Icon.tsx";
import Link from "@/components/ui/Link.tsx";
import { useTranslation } from "react-i18next";
import doorClosedIcon from "@/assets/icons/doorClosed.webp";
import doorOpenIcon from "@/assets/icons/doorOpen.webp";
import { cn } from "@/lib/utils.ts";
import FancyNavigationButton from "./FancyNavigationButton.tsx";

const BackToHomeLink = (props: { className?: string; variant?: "primary" | "secondary" }) => {
  const { t } = useTranslation();

  return (
    <Link to={"/"} tabIndex={-1} preload={"viewport"} className={cn(props.className)}>
      <FancyNavigationButton
        isActive={false}
        label={t("serverPage.back")}
        variant={props.variant}
        tabIndex={0}
        direction={"right"}
        className={"group"}
      >
        <Icon
          src={doorClosedIcon}
          variant={props.variant}
          className="scale-[1.4] group-hover:hidden group-focus:hidden"
        />
        <Icon
          src={doorOpenIcon}
          variant={props.variant}
          className="scale-[1.4] hidden group-hover:inline-block group-focus:inline-block"
        />
      </FancyNavigationButton>
    </Link>
  );
};

export default BackToHomeLink;
