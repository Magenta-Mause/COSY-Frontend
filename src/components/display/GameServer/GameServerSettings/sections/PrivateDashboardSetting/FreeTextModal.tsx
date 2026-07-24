import EditKeyValueInput from "@/components/display/GameServer/EditGameServer/KeyValueInputEditGameServer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";

interface FreeTextModalProps {
  freeText: PrivateDashboardLayoutUI | null;
  setFreeText: React.Dispatch<React.SetStateAction<PrivateDashboardLayoutUI | null>>;
  handleModalConfirm: () => void;
  isModalChanged: boolean;
  errorText: string | null;
}

const FreeTextModal = (props: FreeTextModalProps) => {
  const { freeText, setFreeText, handleModalConfirm, isModalChanged } = props;
  const { t } = useTranslationPrefix("components");

  if (!freeText) return null;

  return (
    <Dialog open onOpenChange={() => setFreeText(null)}>
      <DialogContent className="w-[40vw]">
        <DialogHeader>
          <DialogTitle>{t("GameServerSettings.privateDashboard.freetext.title")}</DialogTitle>
          <DialogDescription>
            {t("GameServerSettings.privateDashboard.freetext.desc")}
          </DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex flex-col">
            <Label className="text-sm font-bold">
              {t("GameServerSettings.privateDashboard.freetext.label")}
            </Label>
            <Input
              placeholder={t("GameServerSettings.privateDashboard.freetext.placeholder")}
              value={freeText.title ?? ""}
              onChange={(e) =>
                setFreeText((prev) => (prev ? { ...prev, title: e.target.value } : prev))
              }
            />
          </div>
          <EditKeyValueInput<{
            key: string;
            value: string;
          }>
            fieldLabel={t("GameServerSettings.privateDashboard.freetext.desc")}
            value={freeText.content?.map((item) => ({
              key: item.key ?? "",
              value: item.value ?? "",
            }))}
            setValue={(vals) =>
              setFreeText((prev) =>
                prev
                  ? {
                      ...prev,
                      content: vals,
                    }
                  : prev,
              )
            }
            placeHolderKeyInput="KEY"
            placeHolderValueInput="VALUE"
            keyValidator={requiredStringValidator}
            valueValidator={requiredStringValidator}
            errorLabel={t("environmentVariablesSelection.errorLabel")}
            required={false}
            inputType="text"
            objectKey="key"
            objectValue="value"
          />
          {props.errorText && <p className="text-sm text-destructive -mt-5 ">{props.errorText}</p>}
        </DialogMain>
        <DialogFooter>
          <Button className="h-11" variant="secondary" onClick={() => setFreeText(null)}>
            {t("GameServerSettings.privateDashboard.freetext.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleModalConfirm}
            className="h-11"
            disabled={!isModalChanged}
          >
            {t("GameServerSettings.privateDashboard.freetext.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreeTextModal;
