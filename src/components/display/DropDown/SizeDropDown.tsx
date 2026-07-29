import { MetricLayoutSize } from "@/api/generated/model";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/Icon.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils";
import type { LayoutSize } from "@/types/layoutSize";

interface SizeDropDownProps {
  className?: string;
  size: LayoutSize;
  uuid?: string;
  handleWidthSelect: (size: LayoutSize, uuid?: string) => void;
}

const SizeDropDown = (props: SizeDropDownProps) => {
  const { t } = useTranslationPrefix("cardWidth");
  const { className, size, uuid, handleWidthSelect } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={cn("w-full", className)}>
          {t(size)}
          <Icon src={arrowDownIcon} variant="secondary" className="size-5 -m-1 mt-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-5 bg-primary-modal-background" align="end">
        <DropdownMenuGroup>
          {[MetricLayoutSize.SMALL, MetricLayoutSize.MEDIUM, MetricLayoutSize.LARGE].map((size) => (
            <DropdownMenuItem key={size} onSelect={() => handleWidthSelect(size, uuid)}>
              {t(size)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SizeDropDown;
