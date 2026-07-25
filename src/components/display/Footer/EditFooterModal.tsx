import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { FooterDto, FooterUpdateDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface EditFooterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footerData?: FooterDto;
}

const EditFooterModal = ({ open, onOpenChange, footerData }: EditFooterModalProps) => {
  const { t } = useTranslationPrefix("footer.editModal");
  const { t: tCommon } = useTranslationPrefix("common");
  const { updateFooter } = useDataInteractions();
  const [formData, setFormData] = useState<FooterUpdateDto>({
    full_name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
  });
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (footerData && open) {
      setFormData({
        full_name: footerData.full_name || "",
        email: footerData.email || "",
        phone: footerData.phone || "",
        street: footerData.street || "",
        city: footerData.city || "",
      });
    }
  }, [footerData, open]);

  const isFormValid =
    formData.full_name.length > 0 &&
    formData.email.length > 0 &&
    formData.phone.length > 0 &&
    formData.street.length > 0 &&
    formData.city.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsPending(true);
    try {
      await updateFooter(formData);
      onOpenChange(false);
    } catch (_error) {
      // Error handling is done in the hook
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <DialogMain>
          <form id="edit-footer-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              header={t("fullName")}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={t("fullNamePlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="email"
              header={t("email")}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="tel"
              header={t("phone")}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t("phonePlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="text"
              header={t("street")}
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder={t("streetPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              type="text"
              header={t("city")}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder={t("cityPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
          </form>
        </DialogMain>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-footer-form"
            disabled={!isFormValid}
            loading={isPending}
            loadingLabel={tCommon("saving")}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFooterModal;
