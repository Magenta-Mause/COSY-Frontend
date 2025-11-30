import GameSign from "@components/display/GameServerConfiguration/GameSign/GameSign.tsx";
import type { CSSProperties } from "react";
import constructionImage from "@/assets/ai-generated/main-page/construction.png";
import { cn } from "@/lib/utils.ts";

const ConstructionPlaceHouse = (props: { className?: string; style?: CSSProperties }) => {
  return (
    <a
      className={cn(
        "block w-[30%] h-auto overflow-visible translate-x-[-9.3vw] translate-y-[0.1vw] aspect-video text-xs relative select-none",
        props.className,
      )}
      aria-label={`Create a new Game Server Configuration`}
      href={"/"}
      style={props.style}
    >
      <img
        className="h-full object-cover max-w-[initial] absolute top-0 left-0"
        aria-label={`Create a new Game Server Configuration`}
        src={constructionImage}
      />
      <GameSign className="bottom-[5%] right-[22%] w-[15%]">New Game Server</GameSign>
    </a>
  );
};

export default ConstructionPlaceHouse;
