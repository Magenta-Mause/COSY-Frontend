import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useTranslation } from "react-i18next";

const RequiredMark = () => {
  const { t } = useTranslation();
  return (
    <TooltipWrapper tooltip={t("common.required")} delayDuration={300}>
      <span className="text-foreground -ml-0.5">*</span>
    </TooltipWrapper>
  );
};

export default RequiredMark;
