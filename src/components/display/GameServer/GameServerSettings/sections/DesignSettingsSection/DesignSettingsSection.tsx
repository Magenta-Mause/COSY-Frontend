import SettingsActionButtons from "@/components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import UnsavedModal from "@/components/ui/UnsavedModal";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import castle from "@/assets/MainPage/castle.png";
import house from "@/assets/MainPage/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { cn } from "@/lib/utils.ts";
import { GameServerDesign } from "@/types/gameServerDesign.ts";

const DesignSettingsSection = () => {
  const { t } = useTranslation();
  const { updateGameServerDesign } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const [selectedDesign, setSelectedDesign] = useState<GameServerDesign>(
    gameServer.design ?? GameServerDesign.HOUSE,
  );
  const [loading, setLoading] = useState(false);
  const hasChanges = selectedDesign !== (gameServer.design ?? GameServerDesign.HOUSE);

  const handleSave = async () => {
    if (!gameServer.uuid) {
      notificationModal.error({ message: t("toasts.missingUuid") });
      return;
    }
    setLoading(true);
    try {
      await updateGameServerDesign(gameServer.uuid, selectedDesign);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = useCallback(() => {
    setSelectedDesign(gameServer.design ?? GameServerDesign.HOUSE);
  }, [gameServer.design]);

  const designs: { value: GameServerDesign; image: string; label: string }[] = [
    {
      value: GameServerDesign.HOUSE,
      image: house,
      label: t("components.gameServerSettings.designSettings.house"),
    },
    {
      value: GameServerDesign.CASTLE,
      image: castle,
      label: t("components.gameServerSettings.designSettings.castle"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>
          {t("components.gameServerSettings.designSettings.title")}
        </h2>
        <p className="text-sm text-muted-foreground leading-none">
          {t("components.gameServerSettings.designSettings.description")}
        </p>
      </div>
      <div className="flex gap-6">
        {designs.map(({ value, image, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedDesign(value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
              selectedDesign === value
                ? "border-button-primary-default bg-button-primary-default/30"
                : "border-button-primary-default hover:bg-button-primary-default/10",
            )}
          >
            <img
              src={image}
              alt={label}
              className="w-32 h-32 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <SettingsActionButtons
        onRevert={handleRevert}
        onConfirm={handleSave}
        revertDisabled={loading || !hasChanges}
        confirmDisabled={!hasChanges}
        loading={loading}
      />
      <UnsavedModal isChanged={hasChanges} onSave={handleSave} />
    </div>
  );
};

export default DesignSettingsSection;
