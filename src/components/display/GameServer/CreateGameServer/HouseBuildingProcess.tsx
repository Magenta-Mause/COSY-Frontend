import type { ParseKeys, TOptions } from "i18next";
import type { GameServerDto } from "@/api/generated/model";
import castle1 from "@/assets/gameServerCreation/castles/castle1.webp";
import castle2 from "@/assets/gameServerCreation/castles/castle2.webp";
import castle3 from "@/assets/gameServerCreation/castles/castle3.webp";
import house1 from "@/assets/gameServerCreation/houses/house1.webp";
import house2 from "@/assets/gameServerCreation/houses/house2.webp";
import house3 from "@/assets/gameServerCreation/houses/house3.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { cn } from "@/lib/utils";

const castles = [castle1, castle2, castle3];
const houses = [house1, house2, house3];
const TOTAL_STEPS = 3;

// Width of the image in pixels per design type.
const IMAGE_WIDTHS: Record<"HOUSE" | "CASTLE", number> = {
  HOUSE: 200,
  CASTLE: 220,
};

// Horizontal offset in pixels to visually center the building, which sits
// left-of-center inside its image because the baked-in shadow occupies the
// right side. The required shift scales with the render width, so these values
// are the original design offsets scaled to the widths above.
// Positive = shift right, negative = shift left.
const IMAGE_X_OFFSETS: Record<"HOUSE" | "CASTLE", [number, number, number]> = {
  HOUSE: [56, 56, 56],
  CASTLE: [50, 52, 52],
};

const HouseBuildingProcess = (props: {
  houseType: GameServerDto["design"];
  currentStep: number;
  serverName?: string;
  stepLabel?: string;
  allStepsFinished?: boolean;
  asChild?: boolean;
}) => {
  const type = props.houseType === "CASTLE" ? "CASTLE" : "HOUSE";
  const currentImage = type === "HOUSE" ? houses[props.currentStep] : castles[props.currentStep];
  const imageWidth = IMAGE_WIDTHS[type];
  const xOffset = IMAGE_X_OFFSETS[type][props.currentStep];
  const children = (
    <>
      <div className="relative">
        <img
          src={currentImage}
          alt={`House building process step ${props.currentStep + 1}`}
          style={{
            width: `${imageWidth}px`,
            imageRendering: "pixelated",
            transform: xOffset !== 0 ? `translateX(${xOffset}px)` : undefined,
          }}
        />
      </div>

      <Stepper
        step={props.currentStep}
        label={props.stepLabel}
        allStepsFinished={props.allStepsFinished}
      />
    </>
  );
  if (props.asChild) return children;

  return (
    <div
      className={
        "bg-background p-5 rounded-lg border-solid border-2 flex flex-col gap-6 overflow-hidden min-w-80"
      }
    >
      {children}
    </div>
  );
};

const Stepper = (props: { step: number; label?: string; allStepsFinished?: boolean }) => {
  const { t } = useTranslationPrefix("components.CreateGameServer");
  const stepTitle =
    props.label ??
    t(
      `steps.step${props.step + 1}.title` as ParseKeys<
        "translation",
        TOptions,
        "components.CreateGameServer"
      >,
    );
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: array indices is a valid key here
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full text-[23px] font-semibold transition-colors border-button-primary-default border-2",
                i < props.step && !props.allStepsFinished
                  ? "bg-button-primary-default/60 text-card"
                  : i === props.step || props.allStepsFinished
                    ? "bg-button-primary-default text-card"
                    : "bg-card text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div
                className={cn(
                  "w-10 h-0.5 transition-colors",
                  i < props.step ? "bg-button-primary-default" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current step title */}
      <p className="text-base font-bold text-center text-balance max-w-64 leading-tight">
        {stepTitle}
      </p>
    </div>
  );
};

export default HouseBuildingProcess;
