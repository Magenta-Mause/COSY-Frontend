import MetricDropDown from "@/components/display/DropDown/MetricDropDown";
import GenericLayoutBuilder from "@/components/display/GameServer/GameServerSettings/sections/GenericLayoutBuilder/GenericLayoutBuilder.tsx";
import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import { type GameServerDto, type MetricLayout, MetricLayoutSize } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { type MetricLayoutUI, MetricsType } from "@/types/metricsTyp";

interface MetricSetting {
  gameServer: GameServerDto;
}

const wrapMetric = (metric: MetricLayout): MetricLayoutUI => ({
  ...metric,
  _uiUuid: metric.uuid ?? generateUuid(),
});

const wrapMetrics = (metrics: MetricLayout[]): MetricLayoutUI[] => metrics.map(wrapMetric);

export default function MetricsSettingsSection(props: MetricSetting) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const { updateGameServerMetricLayout } = useDataInteractions();
  const [metricLayoutState, setMetricLayoutState] = useState<MetricLayoutUI[]>(() =>
    wrapMetrics(gameServer.metric_layout),
  );

  const isChanged = useMemo(() => {
    if (metricLayoutState.length !== gameServer.metric_layout.length) return true;

    return metricLayoutState.some((metric, i) => {
      const original = gameServer.metric_layout[i];
      return metric.size !== original.size || metric.metric_type !== original.metric_type;
    });
  }, [metricLayoutState, gameServer.metric_layout]);

  const handleMetricTypeChange = (type: MetricsType | string, uuid?: string) => {
    if (!uuid) return;

    setMetricLayoutState(
      metricLayoutState.map((metric) =>
        metric._uiUuid === uuid ? { ...metric, metric_type: type } : metric,
      ),
    );
  };

  const newMetric = wrapMetric({
    metric_type: MetricsType.CPU_PERCENT,
    size: MetricLayoutSize.MEDIUM,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("GameServerSettings.sections.metrics")}</h2>
        <p className="text-sm text-muted-foreground leading-none">
          {t("GameServerSettings.sections.metricsDescription")}
        </p>
      </div>
      <GenericLayoutBuilder<MetricLayoutUI>
        gameServer={gameServer}
        layoutSection="metric_layout"
        isChanged={isChanged}
        layouts={metricLayoutState}
        saveHandler={async () =>
          await updateGameServerMetricLayout(gameServer.uuid, metricLayoutState)
        }
        setLayouts={setMetricLayoutState}
        wrapper={wrapMetrics}
        defaultAddNew={newMetric}
      >
        {(metric) => (
          <MetricDropDown
            className="w-full"
            metricType={metric.metric_type}
            setMetricType={(type) => handleMetricTypeChange(type, metric._uiUuid)}
            gameServerUuid={gameServer.uuid}
          />
        )}
      </GenericLayoutBuilder>
    </div>
  );
}
