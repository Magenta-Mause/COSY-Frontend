import { Dialog } from "@components/ui/dialog";
import type { Dispatch, SetStateAction } from "react";
import CreateGameServerModal from "./CreateGameServerModal";

type Props = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
};

export default function CreateGameServer({ openModal, setOpenModal }: Props) {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <CreateGameServerModal setOpen={setOpenModal} />
    </Dialog>
  );
}
