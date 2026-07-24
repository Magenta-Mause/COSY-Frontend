import MetricDropDown from "@components/display/DropDown/MetricDropDown";
import WidgetDropDown from "@components/display/DropDown/WidgetDropDown";
import { Button } from "@components/ui/button";
import Icon from "@components/ui/Icon.tsx";
import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PrivateDashboardLayout,
} from "@/api/generated/model";
import pencilWriteIcon from "@/assets/icons/pencilWrite.webp";
import useCustomMetricKeys from "@/hooks/useCustomMetricKeys/useCustomMetricKeys";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { DashboardElementTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize.ts";
import { MetricsType } from "@/types/metricsTyp";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";
import GenericLayoutBuilder from "../GenericLayoutBuilder/GenericLayoutBuilder";
import FreeTextModal from "./FreeTextModal";

const wrapPrivateDashboard = (dashboard: PrivateDashboardLayout): PrivateDashboardLayoutUI => ({
  ...dashboard,
  _uiUuid: dashboard.uuid ?? generateUuid(),
});

const wrapPrivateDashboards = (dashboard: PrivateDashboardLayout[]): PrivateDashboardLayoutUI[] =>
  dashboard ? dashboard.map(wrapPrivateDashboard) : [];

export default function PrivateDashboardSettingsSection(props: { gameServer: GameServerDto }) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const { updateGameServerPrivateDashboard } = useDataInteractions();
  const [privateDashboard, setPrivateDashboard] = useState<PrivateDashboardLayoutUI[]>(() =>
    wrapPrivateDashboards(gameServer.private_dashboard_layouts),
  );
  const [freeText, setFreeText] = useState<PrivateDashboardLayoutUI | null>(null);
  const [unfulfilledChanges, setUnfulfilledChanges] = useState<string | null>(null);

  const hasMetricWidget = useMemo(
    () =>
      privateDashboard.some((dashboard) => dashboard.layout_type === DashboardElementTypes.METRIC),
    [privateDashboard],
  );
  const customMetrics = useCustomMetricKeys(gameServer.uuid, hasMetricWidget);

  const isChanged = useMemo(() => {
    if (privateDashboard.length !== gameServer.private_dashboard_layouts?.length) return true;

    return privateDashboard.some((dashboard, i) => {
      const original = gameServer.private_dashboard_layouts[i];
      return (
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.title !== original.title ||
        dashboard.layout_type !== original.layout_type ||
        JSON.stringify(dashboard.content ?? []) !== JSON.stringify(original.content ?? [])
      );
    });
  }, [gameServer.private_dashboard_layouts, privateDashboard]);

  const isModalChanged = useMemo(() => {
    if (!freeText) return false;

    const original = privateDashboard.find((d) => d._uiUuid === freeText._uiUuid);

    if (!original) return false;

    return (
      freeText.title !== original.title ||
      JSON.stringify(freeText.content ?? []) !== JSON.stringify(original.content ?? [])
    );
  }, [freeText, privateDashboard]);

  const sanitizePrivateDashboardLayout = (
    layout: PrivateDashboardLayoutUI,
    type: DashboardElementTypes,
  ): PrivateDashboardLayoutUI => {
    const layoutObject: PrivateDashboardLayoutUI = {
      _uiUuid: layout._uiUuid,
      layout_type: type,
      size: layout.size ?? LayoutSize.MEDIUM,
      uuid: layout.uuid,
      valid: true,
    };

    if (type === DashboardElementTypes.METRIC) {
      layoutObject.metric_type = layout.metric_type ?? MetricsType.CPU_PERCENT;
    }

    if (type === DashboardElementTypes.FREETEXT) {
      layoutObject.content = layout.content ?? [{ key: "", value: "" }];
      layoutObject.title = layout.title ?? "";
    }

    return layoutObject;
  };

  const handleTypeSelect = (type: DashboardElementTypes, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === uuid ? sanitizePrivateDashboardLayout(dashboard, type) : dashboard,
      ),
    );
  };

  const handleMetricTypeChange = (type: MetricsType | string, uuid?: string) => {
    if (!uuid) return;

    setPrivateDashboard(
      privateDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  const handleModalConfirm = () => {
    if (!freeText) return;

    setPrivateDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === freeText._uiUuid
          ? { ...dashboard, content: freeText.content, title: freeText.title }
          : dashboard,
      ),
    );
    setFreeText(null);
  };

  const handleFreeTextEdit = (dashboard: PrivateDashboardLayoutUI) => {
    const normalized =
      dashboard.content?.map((item) => ({
        key: item.key ?? "",
        value: item.value ?? "",
      })) ?? [];

    setFreeText({
      ...dashboard,
      content: normalized.length > 0 ? normalized : [{ key: "", value: "" }],
    });
  };

  const newWidget = wrapPrivateDashboard({
    layout_type: DashboardElementTypes.METRIC,
    metric_type: MetricsType.CPU_PERCENT,
    size: MetricLayoutSize.MEDIUM,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div>
        <h2 style={{ lineHeight: "initial" }}>
          {t("GameServerSettings.sections.privateDashboard")}
        </h2>
        <p className="text-sm text-muted-foreground leading-none">
          {t("GameServerSettings.sections.privateDashboardDescription")}
        </p>
      </div>
      <GenericLayoutBuilder<PrivateDashboardLayoutUI>
        gameServer={gameServer}
        layoutSection="private_dashboard_layouts"
        isChanged={isChanged}
        layouts={privateDashboard}
        saveHandler={updateGameServerPrivateDashboard}
        setLayouts={setPrivateDashboard}
        wrapper={wrapPrivateDashboards}
        defaultAddNew={newWidget}
        unfulfilledChanges={unfulfilledChanges}
        setUnfulfilledChanges={setUnfulfilledChanges}
      >
        {(dashboard) => (
          <>
            <div className="flex gap-2">
              <WidgetDropDown
                widgetType={dashboard.layout_type}
                setWidgetType={(type) => {
                  handleTypeSelect(type, dashboard._uiUuid);
                }}
              />
              {dashboard.layout_type === DashboardElementTypes.METRIC && (
                <MetricDropDown
                  className="flex-1"
                  metricType={dashboard.metric_type || MetricsType.CPU_PERCENT}
                  setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                  customMetrics={customMetrics}
                />
              )}
              {dashboard.layout_type === DashboardElementTypes.FREETEXT && (
                <Button variant={"secondary"} onClick={() => handleFreeTextEdit(dashboard)}>
                  <Icon src={pencilWriteIcon} variant="secondary" className="size-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </GenericLayoutBuilder>
      <FreeTextModal
        freeText={freeText}
        setFreeText={setFreeText}
        handleModalConfirm={handleModalConfirm}
        isModalChanged={isModalChanged}
        errorText={unfulfilledChanges}
      />
    </div>
  );
}
