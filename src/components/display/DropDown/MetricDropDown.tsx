import Icon from "@components/ui/Icon.tsx";
import { useTranslation } from "react-i18next";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  extractCustomMetricKey,
  formatMetricDisplayName,
  isCustomMetric,
  MetricsType,
} from "@/types/metricsTyp";

const DROPDOWN_OPTIONS: MetricsType[] = [
  MetricsType.CPU_PERCENT,
  MetricsType.MEMORY_PERCENT,
  MetricsType.MEMORY_USAGE,
  MetricsType.MEMORY_LIMIT,
  MetricsType.BLOCK_READ,
  MetricsType.BLOCK_WRITE,
  MetricsType.NETWORK_INPUT,
  MetricsType.NETWORK_OUTPUT,
];

const MetricDropDown = (props: {
  className?: string;
  disabled?: boolean;
  metricType?: MetricsType | string;
  setMetricType: (unit: string) => void;
  /** Custom metric types the server reports, see `useCustomMetricKeys`. */
  customMetrics?: string[];
}) => {
  const { t } = useTranslation();

  const customMetrics = props.customMetrics ?? [];

  const handleSelect = (type: string) => {
    props.setMetricType(type);
  };

  const getDisplayName = (metricType: string | undefined): string => {
    if (!metricType) return "";

    if (isCustomMetric(metricType)) {
      const key = extractCustomMetricKey(metricType);
      return formatMetricDisplayName(key);
    }

    return t(`metrics.types.${metricType}`);
  };

  return (
    <DropdownMenu open={props.disabled ? false : undefined}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={`${props.className}`} disabled={props.disabled}>
          <span className="truncate max-w-3 md:max-w-10 lg:max-w-50">
            {getDisplayName(props.metricType)}
          </span>
          <Icon src={arrowDownIcon} variant="secondary" className="size-4 -m-1 mt-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40 bg-primary-modal-background" align="center">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
          {t("metrics.standardMetrics")}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {DROPDOWN_OPTIONS.map((type) => (
            <DropdownMenuItem key={type} onSelect={() => handleSelect(type)}>
              {t(`metrics.types.${type}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
          {t("metrics.customMetrics")}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {customMetrics.length > 0 ? (
            customMetrics.map((type) => (
              <DropdownMenuItem key={type} onSelect={() => handleSelect(type)}>
                {formatMetricDisplayName(extractCustomMetricKey(type))}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>{t("metrics.noCustomMetrics")}</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricDropDown;
