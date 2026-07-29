import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo, useState } from "react";
import { v7 as generateUuid } from "uuid";
import type {
  GameServerDto,
  MetricLayout,
  PrivateDashboardLayout,
  PublicDashboardLayout,
} from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import plusIcon from "@/assets/icons/plus.webp";
import SizeDropDown from "@/components/display/DropDown/SizeDropDown";
import SettingsActionButtons from "@/components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import { COL_SPAN_MAP } from "@/components/display/MetricDisplay/metricLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/Icon.tsx";
import UnsavedModal from "@/components/ui/UnsavedModal";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import { DashboardElementTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";

function SortableCard({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        "cursor-grab active:cursor-grabbing touch-manipulation shadow-lg",
        isDragging && "scale-100! shadow-2xl z-10",
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </Card>
  );
}

interface GenericLayoutSelectionProps<T extends { _uiUuid: string; size?: LayoutSize }> {
  gameServer: GameServerDto;
  defaultAddNew: T;
  layoutSection: "private_dashboard_layouts" | "metric_layout" | "public_dashboard";
  isChanged: boolean;
  layouts: T[];
  unfulfilledChanges?: string | null;
  isDisabled?: boolean;
  setUnfulfilledChanges?: (message: string | null) => void;
  saveHandler?: (
    uuid: string,
    layouts: PrivateDashboardLayout[] | MetricLayout[] | PublicDashboardLayout[],
  ) => Promise<void>;
  forceSaveHandler?: (
    uuid: string,
    layouts: PrivateDashboardLayout[] | MetricLayout[] | PublicDashboardLayout[],
  ) => Promise<void>;
  setLayouts: React.Dispatch<React.SetStateAction<T[]>>;
  wrapper: (layouts: T[]) => T[];
  children?: (layout: T) => React.ReactNode;
  warningMessage?: string;
}

export default function GenericLayoutBuilder<T extends { _uiUuid: string; size?: LayoutSize }>(
  props: GenericLayoutSelectionProps<T>,
) {
  const {
    gameServer,
    isChanged,
    layouts,
    unfulfilledChanges,
    layoutSection,
    defaultAddNew,
    isDisabled,
    setLayouts,
    setUnfulfilledChanges,
    children,
    warningMessage,
    saveHandler,
    forceSaveHandler,
  } = props;
  const { t } = useTranslationPrefix("components");
  const [cardErrors, setCardErrors] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const wrap = useCallback((layout: T): T => ({ ...layout, _uiUuid: generateUuid() }), []);
  const wrapper = useCallback((layouts: T[]): T[] => layouts.map(wrap), [wrap]);

  const handleConfirm = useCallback(async () => {
    const errorUuids = layouts
      .filter((layout) => {
        const l = layout as PrivateDashboardLayoutUI;
        return (
          l.layout_type === DashboardElementTypes.FREETEXT &&
          (l.content === undefined ||
            l.content?.length === 0 ||
            l.content?.some((c) => !c.key || !c.value))
        );
      })
      .map((layout) => layout._uiUuid);

    if (errorUuids.length > 0) {
      setCardErrors(new Set(errorUuids));
      setUnfulfilledChanges?.(t("GameServerSettings.privateDashboard.freetext.error"));
      return;
    }

    setCardErrors(new Set());
    setUnfulfilledChanges?.(null);

    setIsSaving(true);
    await saveHandler?.(gameServer.uuid, layouts);
    setIsSaving(false);
  }, [layouts, saveHandler, setUnfulfilledChanges, t, gameServer.uuid]);

  const handleForceConfirm = useCallback(async () => {
    const handler = forceSaveHandler ?? saveHandler;
    if (!handler) return;

    const errorUuids = layouts
      .filter((layout) => {
        const l = layout as PrivateDashboardLayoutUI;
        return (
          l.layout_type === DashboardElementTypes.FREETEXT &&
          (l.content === undefined ||
            l.content?.length === 0 ||
            l.content?.some((c) => !c.key || !c.value))
        );
      })
      .map((layout) => layout._uiUuid);

    if (errorUuids.length > 0) {
      setCardErrors(new Set(errorUuids));
      setUnfulfilledChanges?.(t("GameServerSettings.privateDashboard.freetext.error"));
      return;
    }

    setCardErrors(new Set());
    setUnfulfilledChanges?.(null);

    setIsSaving(true);
    await handler(gameServer.uuid, layouts);
    setIsSaving(false);
  }, [layouts, forceSaveHandler, saveHandler, setUnfulfilledChanges, t, gameServer.uuid]);

  const handleWidthSelect = useCallback(
    (size: LayoutSize, uuid?: string) => {
      if (!uuid) return;
      setLayouts(
        layouts.map((layout) => (layout._uiUuid === uuid ? { ...layout, size: size } : layout)),
      );
    },
    [layouts, setLayouts],
  );

  const handleOnDelete = useCallback(
    (uuid?: string) => {
      if (!uuid) return;
      setLayouts(layouts.filter((layout) => layout._uiUuid !== uuid));
      setCardErrors((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    },
    [layouts, setLayouts],
  );

  const handleOnAdd = useCallback(() => {
    setLayouts([...layouts, { ...defaultAddNew, _uiUuid: generateUuid() }]);
  }, [layouts, defaultAddNew, setLayouts]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = layouts.findIndex((l) => l._uiUuid === active.id);
        const newIndex = layouts.findIndex((l) => l._uiUuid === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          setLayouts(arrayMove(layouts, oldIndex, newIndex));
        }
      }
      setActiveId(null);
    },
    [layouts, setLayouts],
  );

  const activeLayout = activeId ? layouts.find((l) => l._uiUuid === activeId) : null;

  const sortableItems = useMemo(
    () =>
      layouts.map((layout) => (
        <SortableCard
          key={layout._uiUuid}
          id={layout._uiUuid}
          className={cn(
            "relative border-2 border-primary-border rounded-md bg-background/80 w-full h-[16vh] justify-center",
            COL_SPAN_MAP[layout.size ?? LayoutSize.MEDIUM],
            cardErrors.has(layout._uiUuid) && "border-destructive bg-destructive/20",
          )}
        >
          <Button
            variant="destructive"
            disabled={isDisabled}
            className="flex justify-center items-center w-7 h-7 rounded-full absolute top-0 right-0 -mr-3 -mt-2 z-0 p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleOnDelete(layout._uiUuid);
            }}
          >
            <Icon src={closeIcon} className="size-4" />
          </Button>
          <div className="flex gap-2 items-center justify-center overflow-x-auto p-2">
            <div>
              <span className="flex text-lg">{t("GameServerSettings.metrics.type")}</span>
              <span className="flex text-lg">{t("GameServerSettings.metrics.width")}</span>
            </div>
            <div className="flex flex-col gap-2">
              {children?.(layout)}
              <SizeDropDown
                size={layout?.size ?? LayoutSize.MEDIUM}
                uuid={layout._uiUuid}
                handleWidthSelect={handleWidthSelect}
              />
            </div>
          </div>
        </SortableCard>
      )),
    [layouts, cardErrors, children, t, handleWidthSelect, handleOnDelete, isDisabled],
  );

  const getOriginalLayouts = useCallback((): T[] => {
    const section = gameServer[layoutSection];
    if (!section) return [];
    if (Array.isArray(section)) return section as T[];
    if (typeof section === "object" && "layouts" in section) return (section.layouts ?? []) as T[];
    return [];
  }, [gameServer, layoutSection]);

  const handleRevert = useCallback(() => {
    setLayouts(wrapper(getOriginalLayouts()));
    setCardErrors(new Set());
    setUnfulfilledChanges?.(null);
  }, [getOriginalLayouts, wrapper, setLayouts, setUnfulfilledChanges]);

  return (
    <>
      <div className={`flex flex-1 min-h-0 w-full pt-3 ${isDisabled ? "blur-xs" : ""}`}>
        <Card className="w-full grid flex-col min-h-0 content-start">
          <CardContent
            className={
              "grid grid-cols-1 min-[1300px]:grid-cols-6 gap-4 scroller p-6 flex-1 min-h-0"
            }
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={layouts.map((l) => l._uiUuid)}>
                {sortableItems}
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeLayout ? (
                  <Card
                    className={cn(
                      `relative border-2 border-primary rounded-md bg-background/90 shadow-2xl h-[16vh] justify-center cursor-dragging z-50`,
                      COL_SPAN_MAP[activeLayout.size ?? LayoutSize.MEDIUM],
                      cardErrors.has(activeLayout._uiUuid) &&
                        "border-destructive bg-destructive/20",
                    )}
                  >
                    <Button
                      variant="destructive"
                      disabled={isDisabled}
                      className="pointer-events-none flex justify-center items-center w-7 h-7 rounded-full absolute top-0 right-0 -mr-3 -mt-2 opacity-50 z-10 p-2"
                    >
                      <Icon src={closeIcon} className="size-4" />
                    </Button>
                    <div className="flex gap-2 items-center justify-center overflow-x-auto p-2">
                      <div>
                        <span className="flex text-lg">{t("GameServerSettings.metrics.type")}</span>
                        <span className="flex text-lg">
                          {t("GameServerSettings.metrics.width")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {children?.(activeLayout)}
                        <SizeDropDown
                          className={`${isDisabled ? "pointer-events-none" : ""}`}
                          size={activeLayout?.size ?? LayoutSize.MEDIUM}
                          uuid={activeLayout._uiUuid}
                          handleWidthSelect={() => {}} // Disabled during drag
                        />
                      </div>
                    </div>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
            <Button
              onClick={handleOnAdd}
              variant="secondary"
              className={`outline-dashed outline-button-primary-default border-none h-[16vh] col-span-1 min-[1300px]:col-span-3 flex items-center justify-center shadow-none bg-background/35
              ${isDisabled ? "pointer-events-none" : ""}`}
            >
              <div className="flex items-center">
                <Icon src={plusIcon} variant="foreground" className="size-5 m-1" />
                {t("GameServerSettings.privateDashboard.add")}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
      <SettingsActionButtons
        onRevert={handleRevert}
        onConfirm={handleConfirm}
        revertDisabled={!isChanged || isSaving}
        confirmDisabled={!isChanged}
        loading={isSaving}
        errorMessage={cardErrors.size > 0 ? unfulfilledChanges : null}
        requireConfirmationLabel={props.warningMessage}
      />
      <UnsavedModal
        isChanged={isChanged}
        onSave={handleForceConfirm}
        warningMessage={warningMessage}
      />
    </>
  );
}
