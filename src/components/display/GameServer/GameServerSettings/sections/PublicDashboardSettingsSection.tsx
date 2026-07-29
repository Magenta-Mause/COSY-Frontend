import { useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import {
  type GameServerDto,
  MetricLayoutSize,
  type PublicDashboardLayout,
} from "@/api/generated/model";
import pencilWriteIcon from "@/assets/icons/pencilWrite.webp";
import MetricDropDown from "@/components/display/DropDown/MetricDropDown";
import WidgetDropDown from "@/components/display/DropDown/WidgetDropDown";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import Icon from "@/components/ui/Icon.tsx";
import useCustomMetricKeys from "@/hooks/useCustomMetricKeys/useCustomMetricKeys";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { DashboardElementTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize";
import { MetricsType } from "@/types/metricsTyp";
import type { PublicDashboardLayoutUI } from "@/types/publicDashboard";
import GenericLayoutBuilder from "./GenericLayoutBuilder/GenericLayoutBuilder";
import FreeTextModal from "./PrivateDashboardSetting/FreeTextModal";

const wrapPublicDashboard = (dashboard: PublicDashboardLayout): PublicDashboardLayoutUI => ({
  ...dashboard,
  _uiUuid: dashboard.uuid ?? generateUuid(),
});

const wrapPublicDashboards = (dashboard: PublicDashboardLayout[]): PublicDashboardLayoutUI[] =>
  dashboard.map(wrapPublicDashboard);

export default function PublicDashboardSettingsSection(props: { gameServer: GameServerDto }) {
  const { gameServer } = props;
  const { t } = useTranslationPrefix("components");
  const [publicDashboard, setPublicDashboard] = useState<PublicDashboardLayoutUI[]>(() =>
    wrapPublicDashboards(gameServer.public_dashboard.layouts ?? []),
  );
  const { updateGameServerPublicDashboard } = useDataInteractions();
  const [freeText, setFreeText] = useState<PublicDashboardLayoutUI | null>(null);
  const [unfulfilledChanges, setUnfulfilledChanges] = useState<string | null>(null);
  const [checked, setChecked] = useState(gameServer.public_dashboard.enabled ?? false);

  const hasMetricWidget = useMemo(
    () =>
      publicDashboard.some((dashboard) => dashboard.layout_type === DashboardElementTypes.METRIC),
    [publicDashboard],
  );
  const customMetrics = useCustomMetricKeys(gameServer.uuid, hasMetricWidget);

  const isChanged = useMemo(() => {
    if (publicDashboard.length !== gameServer.public_dashboard?.layouts?.length) return true;

    return publicDashboard.some((dashboard, i) => {
      const original = gameServer.public_dashboard?.layouts?.at(i);
      if (!original) return false;
      return (
        gameServer.public_dashboard.enabled !== checked ||
        dashboard.size !== original.size ||
        dashboard.metric_type !== original.metric_type ||
        dashboard.content !== original.content ||
        dashboard.title !== original.title ||
        dashboard.layout_type !== original.layout_type ||
        JSON.stringify(dashboard.content ?? []) !== JSON.stringify(original.content ?? [])
      );
    });
  }, [
    gameServer.public_dashboard.layouts,
    publicDashboard,
    gameServer.public_dashboard.enabled,
    checked,
  ]);

  const isModalChanged = useMemo(() => {
    if (!freeText) return false;

    const original = publicDashboard.find((d) => d._uiUuid === freeText._uiUuid);

    if (!original) return false;

    return (
      freeText.title !== original.title ||
      JSON.stringify(freeText.content ?? []) !== JSON.stringify(original.content ?? [])
    );
  }, [freeText, publicDashboard]);

  const sanitizePrivateDashboardLayout = (
    layout: PublicDashboardLayoutUI,
    type: DashboardElementTypes,
  ): PublicDashboardLayoutUI => {
    const layoutObject: PublicDashboardLayoutUI = {
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

    setPublicDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === uuid ? sanitizePrivateDashboardLayout(dashboard, type) : dashboard,
      ),
    );
  };

  const handleMetricTypeChange = (type: MetricsType | string, uuid?: string) => {
    if (!uuid) return;

    setPublicDashboard(
      publicDashboard.map((dashboard) =>
        dashboard._uiUuid === uuid ? { ...dashboard, metric_type: type } : dashboard,
      ),
    );
  };

  const handleModalConfirm = () => {
    if (!freeText) return;

    setPublicDashboard((prev) =>
      prev.map((dashboard) =>
        dashboard._uiUuid === freeText._uiUuid
          ? { ...dashboard, content: freeText.content, title: freeText.title }
          : dashboard,
      ),
    );
    setFreeText(null);
  };

  const handleFreeTextEdit = (dashboard: PublicDashboardLayoutUI) => {
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

  const newWidget = wrapPublicDashboard({
    layout_type: DashboardElementTypes.METRIC,
    metric_type: MetricsType.CPU_PERCENT,
    size: MetricLayoutSize.MEDIUM,
  });

  const isSensitive = useMemo(() => {
    if (!checked) return false;
    return publicDashboard.some(
      (dashboard) =>
        dashboard.layout_type === DashboardElementTypes.METRIC ||
        dashboard.layout_type === DashboardElementTypes.LOGS,
    );
  }, [checked, publicDashboard]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div>
        <h2 style={{ lineHeight: "initial" }}>
          {t("GameServerSettings.sections.publicDashboard")}
        </h2>
        <p className="text-sm text-muted-foreground leading-none">
          {t("GameServerSettings.sections.publicDashboardDescription")}
        </p>
      </div>
      <FieldGroup className="my-1">
        <button
          type={"button"}
          onClick={() => setChecked((prev) => !prev)}
          className="flex items-center gap-2"
        >
          <Checkbox checked={checked} />
          <span className={"text-sm"}>{t("GameServerSettings.publicDashboard.label")}</span>
        </button>
      </FieldGroup>
      <GenericLayoutBuilder<PublicDashboardLayoutUI>
        gameServer={gameServer}
        layoutSection="public_dashboard"
        isChanged={isChanged}
        layouts={publicDashboard}
        saveHandler={async (uuid, layout) => {
          await updateGameServerPublicDashboard(uuid, { layouts: layout, enabled: checked });
        }}
        warningMessage={
          isSensitive
            ? t("GameServerSettings.publicDashboard.sensitiveWarning.description")
            : undefined
        }
        setLayouts={setPublicDashboard}
        wrapper={wrapPublicDashboards}
        defaultAddNew={newWidget}
        unfulfilledChanges={unfulfilledChanges}
        setUnfulfilledChanges={setUnfulfilledChanges}
        isDisabled={!checked}
      >
        {(dashboard) => (
          <>
            <div className={"flex gap-2"}>
              <WidgetDropDown
                className={`${checked ? "" : "pointer-events-none"}`}
                widgetType={dashboard.layout_type}
                setWidgetType={(type) => {
                  handleTypeSelect(type, dashboard._uiUuid);
                }}
              />
              {dashboard.layout_type === DashboardElementTypes.METRIC && (
                <MetricDropDown
                  className={`flex-1 ${checked ? "" : "pointer-events-none"}`}
                  metricType={dashboard.metric_type || MetricsType.CPU_PERCENT}
                  customMetrics={customMetrics}
                  setMetricType={(type) => handleMetricTypeChange(type, dashboard._uiUuid)}
                />
              )}
              {dashboard.layout_type === DashboardElementTypes.FREETEXT && (
                <Button
                  className={`${checked ? "" : "pointer-events-none"}`}
                  variant={"secondary"}
                  onClick={() => handleFreeTextEdit(dashboard)}
                >
                  <Icon src={pencilWriteIcon} variant="foreground" className="size-5" />
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
