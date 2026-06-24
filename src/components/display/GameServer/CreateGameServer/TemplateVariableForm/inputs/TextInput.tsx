import { Button } from "@components/ui/button.tsx";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input";
import RequiredMark from "@components/ui/RequiredMark.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import infoIcon from "@/assets/icons/info.webp";
import TemplateInputDescription from "../TemplateInputDescription";
import type { VariableInputProps } from "./types";

export default function TextInput({
  variable,
  value,
  showError,
  errorMessage,
  onValueChange,
  onEnterKey,
  t,
  isRequired,
}: VariableInputProps) {
  const placeholder = variable.placeholder ?? "";

  return (
    <div key={placeholder} className="space-y-2">
      <Input
        id={placeholder}
        header={
          <>
            {variable.name} {isRequired && <RequiredMark />}
          </>
        }
        type="text"
        placeholder={
          variable.example ? `${t("examplePrefix")} ${String(variable.example)}` : variable.name
        }
        value={String(value ?? "")}
        onChange={(e) => onValueChange(variable, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnterKey();
          }
        }}
        error={showError ? (errorMessage ? t(errorMessage) : t("validationError")) : undefined}
        endDecorator={
          variable.regex ? (
            <TooltipWrapper
              tooltip={`${t("pattern")}: ${variable.regex}`}
              side="top"
              asChild={true}
            >
              <Button variant={"ghost"} className={"p-0.25! m-0! h-fit focus-visible:ring-0"}>
                <Icon src={infoIcon} className="size-4" variant="foreground" />
              </Button>
            </TooltipWrapper>
          ) : undefined
        }
      />
      <TemplateInputDescription htmlFor={placeholder} description={variable.description} />
    </div>
  );
}
