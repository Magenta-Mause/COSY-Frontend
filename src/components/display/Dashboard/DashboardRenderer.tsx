import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import MetricGraph from "@components/display/MetricDisplay/MetricGraph";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Card } from "@components/ui/card";
import { MetricLayoutSize } from "@/api/generated/model";
import type { PrivateDashboardLayout } from "@/api/generated/model/privateDashboardLayout";
import type { PublicDashboardLayout } from "@/api/generated/model/publicDashboardLayout";
import useIsDesktop from "@/hooks/useIsDesktop/useIsDesktop.tsx";
import type { GameServerLogWithUuid } from "@/stores/slices/gameServerLogSlice";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import { DashboardElementTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize.ts";
import type { MetricsType } from "@/types/metricsTyp";

interface DashboardRendererProps {
  dashboardLayout: (PrivateDashboardLayout | PublicDashboardLayout)[];
  metrics: GameServerMetricsWithUuid[];
  logs: GameServerLogWithUuid[];
  serverId: string;
  isServerRunning: boolean;
  canReadMetrics: boolean;
  canReadLogs: boolean;
  canSendCommands: boolean;
  overridePermissionCheck?: boolean;
}

export default function DashboardRenderer({
  dashboardLayout,
  metrics,
  logs,
  serverId,
  isServerRunning,
  canReadMetrics,
  canReadLogs,
  canSendCommands,
  overridePermissionCheck,
}: DashboardRendererProps) {
  const isDesktop = useIsDesktop();
  return (
    <div className="grid grid-cols-1 min-[1300px]:grid-cols-6 gap-2 p-4 pb-6">
      {dashboardLayout?.map((dashboard) => {
        const dashboardType = dashboard.layout_type;
        const sizeClass = COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM];

        switch (dashboardType) {
          case DashboardElementTypes.METRIC:
            return (
              <MetricGraph
                key={dashboard.uuid}
                timeUnit="hour"
                type={dashboard.metric_type as MetricsType}
                metrics={metrics}
                className={sizeClass}
                canReadMetrics={canReadMetrics}
                overridePermissionCheck={overridePermissionCheck}
              />
            );

          case DashboardElementTypes.LOGS:
            return (
              <div
                key={dashboard.uuid}
                className={`${isDesktop ? "h-[18vw]" : "h-80"} ${sizeClass}`}
              >
                <LogDisplay
                  logMessages={logs}
                  showCommandInput={canSendCommands}
                  gameServerUuid={serverId}
                  isServerRunning={isServerRunning}
                  canReadLogs={canReadLogs}
                  hideTimestamps={dashboard.size === LayoutSize.SMALL ? true : undefined}
                  overridePermissionCheck={overridePermissionCheck}
                />
              </div>
            );

          case DashboardElementTypes.FREETEXT:
            return (
              <div
                key={dashboard.uuid}
                className={`aspect-square min-[1300px]:aspect-16/7 ${sizeClass}`}
              >
                <Card className={`w-full h-full overflow-y-auto`} key={dashboard.uuid}>
                  <h2 className="mt-5 ml-5">{dashboard.title}</h2>
                  {dashboard.content?.map((keyValue) => (
                    <div key={dashboard.uuid} className="flex flex-col">
                      <div className="mx-5">
                        <p className="overflow-y-auto text-base font-bold bg-button-primary-default text-button-secondary-default w-fit px-2 rounded-t-md ">
                          {keyValue.key}
                        </p>
                        <p className="overflow-y-auto text-lg w-full border-2 rounded-b-md rounded-r-md px-2 ">
                          {keyValue.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
