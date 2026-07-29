import doorClosedIcon from "@/assets/icons/doorClosed.webp";
import doorOpenIcon from "@/assets/icons/doorOpen.webp";
import Icon from "@/components/ui/Icon.tsx";
import Link from "@/components/ui/Link.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils.ts";
import FancyNavigationButton from "./FancyNavigationButton.tsx";

const BackToHomeLink = (props: { className?: string; variant?: "primary" | "secondary" }) => {
  const { t } = useTranslationPrefix("serverPage");

  return (
    <Link to={"/"} tabIndex={-1} preload={"viewport"} className={cn(props.className)}>
      <FancyNavigationButton
        isActive={false}
        label={t("back")}
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
