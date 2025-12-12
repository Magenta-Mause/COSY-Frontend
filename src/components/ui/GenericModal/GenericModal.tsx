import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "../button";
import type { VariantProps } from "class-variance-authority";

type ModalButton = {
  label?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
  disable?: boolean;
};

const GenericModal = (props: {
  header: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;

  open?: boolean;
  subheader?: string;
  modalClassName?: string;
  modalContentClassName?: string;

  modalTrigger?: ModalButton;
  footerButtons?: ModalButton[];
  closeButton?: ModalButton;
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.modalTrigger && (
        <DialogTrigger asChild>
          <Button
            onClick={props.modalTrigger.onClick}
            variant={props.modalTrigger.variant}
            className={props.modalTrigger.className}
            disabled={props.modalTrigger.disable}
          >
            {props.modalTrigger.icon}
            {props.modalTrigger.label}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn("bg-[#F3AA71] font-mono", props.modalClassName)}
      >
        <DialogHeader>
          <DialogTitle className="text-[1.5rem] text-[#6E2727]">
            {props.header}
          </DialogTitle>

          {props.subheader && (
            <DialogDescription className="text-[1rem] text-[#6E2727]">
              {props.subheader}
            </DialogDescription>
          )}
        </DialogHeader>

        <div
          className={cn(
            "bg-[#FFCDA7] border-3 border-[#6E2727] rounded-xl p-3 text-[1rem] text-[#6E2727]",
            props.modalContentClassName
          )}
        >
          {props.children}
        </div>

        <DialogFooter className="flex justify-between items-center">

          {props.closeButton && (
            <DialogClose asChild>
              <Button
                onClick={props.closeButton.onClick}
                variant={props.closeButton.variant ?? "default"}
                className={cn(props.closeButton.className, "h-full")}
                disabled={props.closeButton.disable}
              >
                {props.closeButton.icon}
                {props.closeButton.label || t("genericModal.cancel")}
              </Button>
            </DialogClose>
          )}

          {props.footerButtons && props.footerButtons.length > 0 && (
            <div className="flex gap-3 h-full">
              {props.footerButtons.map((button, index) => (
                <Button
                  key={index}
                  onClick={button.onClick}
                  variant={button.variant ?? "default"}
                  className={cn(button.className, "h-full")}
                  disabled={button.disable}
                >
                  {button.icon}
                  {button.label}
                </Button>
              ))}
            </div>
          )}

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenericModal;
