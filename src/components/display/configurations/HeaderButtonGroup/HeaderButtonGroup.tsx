import LanguageSelector from "@components/display/configurations/HeaderButtonGroup/LanguageSelector/LanguageSelector.tsx";
import UserModalButton from "@components/display/configurations/HeaderButtonGroup/UserModalButton/UserModalButton.tsx";
import { cn } from "@/lib/utils.ts";

const HeaderButtonGroup = (props: { className?: string }) => {
  return (
    <div className={cn("flex gap-[2vw]", props.className)}>
      <UserModalButton />
      <LanguageSelector />
    </div>
  );
};

export default HeaderButtonGroup;
