import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { useContext, useMemo } from "react";
import type { GameServerDto } from "@/api/generated/model";
import bush1 from "@/assets/deko/bush1.png";
import bush2 from "@/assets/deko/bush2.png";
import bush3 from "@/assets/deko/bush3.png";
import bush4 from "@/assets/deko/bush4.png";
import stone from "@/assets/deko/StoneWithHugo.webp";
import tree1_1 from "@/assets/deko/tree1_1.png";
import tree1_2 from "@/assets/deko/tree1_2.png";
import tree1_3 from "@/assets/deko/tree1_3.png";
import tree1_4 from "@/assets/deko/tree1_4.png";
import tree2_1 from "@/assets/deko/tree2_1.png";
import tree2_2 from "@/assets/deko/tree2_2.png";
import tree2_3 from "@/assets/deko/tree2_3.png";
import tree2_4 from "@/assets/deko/tree2_4.png";
import { cn } from "@/lib/utils";
import dekoCalculateCoordinate from "./dekoCalculateCoordinate";

type DekoAssetGroup = {
  variations: DekoAsset[];
};

type DekoAsset = {
  src: string;
  width: string;
  translate?: string;
};

const DekoAssetsAligner = (props: { gameServers: GameServerDto[] }) => {
  const { authorized, canCreateGameServers } = useContext(AuthContext);
  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = dekoCalculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}vw`,
      top: `${y * 180}vw`,
      width: "25%",
    };
  };

  const dekoAssetGroups: DekoAssetGroup[] = [
    {
      variations: [bush1, bush2, bush3, bush4].map((src) => ({ src, width: "5vw" })),
    },
    {
      variations: [tree1_1, tree1_2, tree1_3, tree1_4].map((src) => ({
        src,
        width: "6vw",
        translate: "-translate-y-[4vw]",
      })),
    },
    {
      variations: [tree2_1, tree2_2, tree2_3, tree2_4].map((src) => ({
        src,
        width: "8vw",
        translate: "-translate-y-[1vw]",
      })),
    },
    {
      variations: [
        { src: stone, width: "16vw", translate: "-translate-y-[4vw] -translate-x-[5vw]" },
      ],
    },
  ];

  const EXTRA_DEKO_COUNT = 2;
  const DEKO_BASE_CLASS = "pointer-events-none select-none";

  const extraSeeds = useMemo(() => {
    if (!authorized || !canCreateGameServers) return [];
    return Array.from({ length: EXTRA_DEKO_COUNT }, () => Math.random().toString(36).slice(2));
  }, [authorized, canCreateGameServers]);

  const getDekoAsset = (seed: string): DekoAsset => {
    const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const group = dekoAssetGroups[hash % dekoAssetGroups.length];
    const variation = group.variations[(hash >> 4) % group.variations.length];
    return variation;
  };

  return [
    ...props.gameServers.flatMap((gameServer, index) => {
      const asset0 = getDekoAsset(`${gameServer.uuid}-0`);
      const asset1 = getDekoAsset(`${gameServer.uuid}-1`);

      return [
        <img
          key={`${gameServer.uuid}-0`}
          src={asset0.src}
          style={{ ...getStyle(index * 2), imageRendering: "pixelated", width: asset0.width }}
          className={cn(DEKO_BASE_CLASS, asset0.translate)}
          aria-hidden
        />,
        <img
          key={`${gameServer.uuid}-1`}
          src={asset1.src}
          style={{ ...getStyle(index * 2 + 1), imageRendering: "pixelated", width: asset1.width }}
          className={cn(DEKO_BASE_CLASS, asset1.translate)}
          aria-hidden
        />,
      ];
    }),

    ...extraSeeds.map((seed, i) => {
      const asset = getDekoAsset(`extra-${seed}`);

      return (
        <img
          key={`extra-${seed}`}
          src={asset.src}
          style={{
            ...getStyle(props.gameServers.length * 2 + i),
            imageRendering: "pixelated",
            width: asset.width,
          }}
          className={cn(DEKO_BASE_CLASS, asset.translate)}
          aria-hidden
        />
      );
    }),
  ];
};
export default DekoAssetsAligner;
