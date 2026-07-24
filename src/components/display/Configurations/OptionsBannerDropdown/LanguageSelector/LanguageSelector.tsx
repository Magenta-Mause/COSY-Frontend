import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import globeIcon from "@/assets/icons/globe.webp";
import { cn } from "@/lib/utils.ts";

const LANGUAGES = [
  {
    label: "English",
    value: "en",
  },
  {
    label: "Deutsch",
    value: "de",
  },
];

const LanguageSelector = (props: {
  className?: string;
  tabIndex?: number;
  onLanguageChange?: () => void;
}) => {
  const { t, i18n } = useTranslationPrefix("optionsBanner");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn("h-auto aspect-square", props.className)}
          tabIndex={props.tabIndex}
          aria-label={t("languageSelector")}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Icon src={globeIcon} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className={"z-101 flex flex-col gap-2 p-1.5 w-40 h-auto justify-evenly border-2"}
      >
        {LANGUAGES.map((language) => (
          <Button
            key={language.value}
            className={"text-xs"}
            onClick={(e) => {
              e.stopPropagation();
              i18n.changeLanguage(language.value);
              props.onLanguageChange?.();
            }}
          >
            {language.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
