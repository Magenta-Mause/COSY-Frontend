import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const RequiredMark = () => {
  const { t } = useTranslationPrefix("common");
  return (
    <TooltipWrapper tooltip={t("required")} delayDuration={300}>
      <span className="text-foreground -ml-0.5">*</span>
    </TooltipWrapper>
  );
};

export default RequiredMark;
