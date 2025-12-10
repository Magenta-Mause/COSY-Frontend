import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "../button";

type ModalButton = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary";
  className?: string;
  disable?: boolean;
};

const GenericModal = (props: {
  dialogTrigger?: {
    label?: string | ReactNode; // now supports ReactNode
    className?: string; // optional classes for trigger button
    onClick?: () => void; // optional click handler
  };
  header: string;
  subheader?: string;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  modalClassName?: string;
  modalContentClassName?: string;
  children: ReactNode;
  footerButtons?: ModalButton[];
  closeButton?: {
    label?: string; 
    className?: string;
    onClick?: () => void;
  };
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      
      {props.dialogTrigger && (
        <DialogTrigger asChild>
          <Button
            onClick={props.dialogTrigger.onClick}
            className={props.dialogTrigger.className}
          >
            {props.dialogTrigger.label || t("openModal")}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className={cn("bg-[#F3AA71] font-mono", props.modalClassName)}>
        <DialogHeader>
          <DialogTitle className="text-[1.5rem] text-[#6E2727]">{props.header}</DialogTitle>
          <DialogDescription className="text-[1rem] text-[#6E2727]">{props.subheader}</DialogDescription>
        </DialogHeader>

        <div className={cn(" bg-[#FFCDA7] border-3 border-[#6E2727] rounded-xl p-3 text-[1rem] text-[#6E2727]", props.modalContentClassName)}>
          {props.children}
        </div>

        <DialogFooter className="flex justify-between items-center">
          {props.closeButton && (
            <DialogClose asChild>
              <Button
                onClick={props.closeButton.onClick}
                variant={"default"}
                className={cn(props.closeButton.className, "h-full")}
              >
                {props.closeButton.label || t("cancel")}
              </Button>
            </DialogClose>
          )}

          {props.footerButtons && props.footerButtons.length > 0 && (
            <div className="flex gap-3 h-full">
              {props.footerButtons.map((button, index) => (
                <Button
                  key={index}
                  onClick={button.onClick}
                  variant={button.variant || "default"}
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
