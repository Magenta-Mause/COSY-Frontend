import Icon from "@/components/ui/Icon.tsx";
import { PrivateDashboardLayoutPrivateDashboardTypes } from "@/api/generated/model";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const DROPDOWN_OPTIONS: PrivateDashboardLayoutPrivateDashboardTypes[] = [
  PrivateDashboardLayoutPrivateDashboardTypes.METRIC,
  PrivateDashboardLayoutPrivateDashboardTypes.LOGS,
  PrivateDashboardLayoutPrivateDashboardTypes.FREETEXT,
];

const WidgetDropDown = (props: {
  className?: string;
  disabled?: boolean;
  widgetType?: PrivateDashboardLayoutPrivateDashboardTypes;
  setWidgetType: (unit: PrivateDashboardLayoutPrivateDashboardTypes) => void;
}) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.privateDashboard.types");

  const handleSelect = (type: PrivateDashboardLayoutPrivateDashboardTypes) => {
    props.setWidgetType(type);
  };

  return (
    <DropdownMenu open={props.disabled ? false : undefined}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={`flex-1 ${props.className}`}
          disabled={props.disabled}
        >
          <span className="truncate max-w-3 md:max-w-10 lg:max-w-50">
            {t(props.widgetType ?? PrivateDashboardLayoutPrivateDashboardTypes.METRIC)}
          </span>
          <Icon src={arrowDownIcon} variant="secondary" className="size-4 -m-1 mt-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30 bg-primary-modal-background" align="end">
        <DropdownMenuGroup>
          {DROPDOWN_OPTIONS.map((type) => (
            <DropdownMenuItem key={type} onSelect={() => handleSelect(type)}>
              {t(type)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WidgetDropDown;
