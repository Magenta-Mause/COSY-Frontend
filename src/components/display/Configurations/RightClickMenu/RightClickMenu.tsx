import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@components/ui/context-menu.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { type ReactNode, useState } from "react";

export interface RightClickChildren {
  label: string;
  onClick?: () => Promise<void> | void;
  value?: string;
  tooltip?: string;
}

export interface RightClickAction {
  label: string;
  onClick?: () => Promise<void> | void;
  render?: ReactNode;
  closeOnClick?: boolean;
  disabled?: boolean;
  tooltip?: string;
  destructive?: boolean;
  children?: RightClickChildren[];
  value?: string;
}

interface RightClickMenuProps {
  actions: RightClickAction[];
  children: ReactNode;
}

const RightClickMenu = (props: RightClickMenuProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        {props.actions.map((action, index) =>
          action.render ? (
            <div key={action.label || index}>{action.render}</div>
          ) : !action.children ? (
            <TooltipWrapper key={action.label} tooltip={action.tooltip} side="right">
              <ContextMenuItem
                onSelect={async (e) => {
                  if (action.closeOnClick === false) {
                    e.preventDefault();
                  }
                  if (action.onClick) {
                    setLoading(true);
                    await action.onClick();
                    setLoading(false);
                  }
                }}
                disabled={loading || action.disabled}
                variant={action.destructive ? "destructive" : "default"}
                className="[&[data-disabled]]:pointer-events-auto"
              >
                {action.label}
              </ContextMenuItem>
            </TooltipWrapper>
          ) : (
            <ContextMenuSub key={action.label}>
              <ContextMenuSubTrigger>{action.label}</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuRadioGroup value={action.value}>
                  {action.children.map((child) => (
                    <TooltipWrapper
                      key={child.label}
                      tooltip={child.tooltip ?? null}
                      side="right"
                      asChild
                    >
                      <ContextMenuRadioItem onSelect={child.onClick} value={child.value ?? ""}>
                        {child.label}
                      </ContextMenuRadioItem>
                    </TooltipWrapper>
                  ))}
                </ContextMenuRadioGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RightClickMenu;
