import reloadIcon from "@/assets/icons/reload.webp";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Centered pixel-art loading indicator — the same spinning `reload` icon the
 * shared button uses, reused for panel-level loading branches. Size it via
 * `className` (e.g. `size-8`).
 */
const Spinner = ({ className }: { readonly className?: string }) => (
  <Icon src={reloadIcon} className={cn("animate-spin text-current", className)} />
);

export default Spinner;
