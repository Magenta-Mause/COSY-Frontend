import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@components/ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { GlobeIcon } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
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

const LanguageSelector = (props: { className?: string }) => {
  const { i18n } = useTranslation();
  const { handleLogout } = useContext(AuthContext);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn("h-auto p-[.5vw] aspect-square", props.className)}
          aria-label={"Select Language"}
        >
          <GlobeIcon className="!h-[1.5vw] p-0 !w-auto aspect-square" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={
          "z-[101] flex flex-col gap-[.5vw] p-[0.4vw] px-[.7vw] w-[9vw] h-[7vw] justify-evenly mt-[.5vw] mr-[1vw]"
        }
      >
        {LANGUAGES.map((language) => (
          <Button
            key={language.value}
            className={"text-[1vw] h-[1.5vw]"}
            onClick={() => i18n.changeLanguage(language.value)}
          >
            {language.label}
          </Button>
        ))}
        {/* added temporary logout button - should be moved */}
        <Button className={"text-[1vw] h-[1.5vw]"} onClick={() => handleLogout()}>
          {i18n.t("signIn.logout")}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
