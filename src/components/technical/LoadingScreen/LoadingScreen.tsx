import { useTranslation } from "react-i18next";
import spinnerGif from "@/assets/gifs/spinner.gif";

interface Props {
  visible: boolean;
  onFaded: () => void;
}

const LoadingScreen = ({ visible, onFaded }: Props) => {
  const { t } = useTranslation();
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}
      onTransitionEnd={!visible ? onFaded : undefined}
    >
      <img src={spinnerGif} alt="" style={{ imageRendering: "pixelated" }} className="w-24 h-24" />
      <h2 className="mt-6">{t("common.loading")}</h2>
    </div>
  );
};

export default LoadingScreen;
