// import GameServerConfigurationHouse from "@components/display/GameServerConfiguration/GameServerConfigurationHouse/GameServerConfigurationHouse.tsx";
// import calculateCoordinate from "@components/display/GameServerConfiguration/GameServerConfigurationHouseAligner/calculateCoordinate.ts";

import GameServerHouse from "@components/display/GameServer/GameServerHouse/GameServerHouse";
import calculateCoordinate from "@components/display/GameServer/GameServerHouseAligner/calculateCoordinate";
import type { GameServerConfigurationEntity } from "@/api/generated/model";

const GameServerConfigurationHouseAligner = (props: {
  gameServers: GameServerConfigurationEntity[];
}) => {
  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}%`,
      top: `${y}px`,
    };
  };

  return (
    <div className="w-full h-full relative">
      {props.gameServers.map((gameServer, index) => (
        <GameServerHouse key={gameServer.uuid} gameServer={gameServer} style={getStyle(index)} />
      ))}
    </div>
  );
};

export default GameServerConfigurationHouseAligner;
