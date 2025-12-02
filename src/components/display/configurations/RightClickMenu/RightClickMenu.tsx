import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@components/ui/context-menu.tsx";
import { type ReactNode, useState } from "react";

export interface RightClickAction {
  label: string;
  onClick?: () => Promise<void> | void;
  render?: ReactNode;
  closeOnClick?: boolean;
}

interface RightClickMenuProps {
  actions: RightClickAction[];
  children: ReactNode;
}

const RightClickMenu = (props: RightClickMenuProps) => {
  const closeModal = () => {
    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(escapeEvent);
  };
  const [loading, setLoading] = useState(false);

  const handleAsync = async (callback: () => Promise<void> | void) => {
    setLoading(true);
    await callback();
    setLoading(false);
    closeModal();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        {props.actions.map((action, index) =>
          action.render ? (
            <div key={action.label || index}>{action.render}</div>
          ) : (
            <ContextMenuItem
              key={action.label}
              onSelect={async (e) => {
                if (action.closeOnClick === false) {
                  e.preventDefault();
                }
                if (action.onClick) {
                  // We don't use handleAsync here because it closes the modal, which we want to control.
                  setLoading(true);
                  await action.onClick();
                  setLoading(false);
                }
              }}
              className={"font-mono"}
              disabled={loading}
            >
              {action.label}
            </ContextMenuItem>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RightClickMenu;
