import ConstructionPlaceHouse from "@components/display/GameServerConfiguration/ConstructionPlaceHouse/ConstructionPlaceHouse.tsx";
import GameServerConfigurationHouse from "@components/display/GameServerConfiguration/GameServerConfigurationHouse/GameServerConfigurationHouse.tsx";
import calculateCoordinate from "@components/display/GameServerConfiguration/GameServerConfigurationHouseAligner/calculateCoordinate.ts";
import type { GameServerConfigurationEntity } from "@/api/generated/model";

const GameServerHouseAligner = (props: { gameServers: GameServerConfigurationEntity[] }) => {
  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}vw`,
      top: `${y * 100}vw`,
    };
  };

  return (
    <div className="w-full h-full relative">
      {props.gameServers.map((gameServer, index) => (
        <GameServerConfigurationHouse
          key={gameServer.uuid}
          gameServer={gameServer}
          style={getStyle(index)}
        />
      ))}
      <ConstructionPlaceHouse style={getStyle(props.gameServers.length)} />
    </div>
  );
};

export default GameServerHouseAligner;
