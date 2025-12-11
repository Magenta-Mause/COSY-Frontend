import { Button } from "@components/ui/button";
import { Dialog, DialogTrigger } from "@components/ui/dialog";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import CreateGameServerModal from "./CreateGameServerModal";

export default function CreateGameServer() {
  const { t } = useTranslationPrefix("components.CreateGameServer");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("openButton")}</Button>
      </DialogTrigger>
      <CreateGameServerModal setOpen={setOpen} />
    </Dialog>
  );
}
