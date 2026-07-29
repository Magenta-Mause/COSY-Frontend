import { useContext } from "react";
import type { GameServerDto } from "@/api/generated/model";
import ConstructionPlaceHouse from "@/components/display/GameServer/ConstructionPlace/ConstructionPlaceHouse.tsx";
import GameServerHouse from "@/components/display/GameServer/GameServerHouse/GameServerHouse.tsx";
import calculateCoordinate from "@/components/display/GameServer/GameServerHouseAligner/calculateCoordinate.ts";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";

const GameServerHouseAligner = (props: { gameServers: GameServerDto[] }) => {
  const { authorized, canCreateGameServers } = useContext(AuthContext);

  const getStyle = (index: number): React.CSSProperties => {
    const { x, y } = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}vw`,
      top: `${y * 100}vw`,
      width: "25%",
    };
  };

  return (
    <div className="w-full h-full relative">
      {props.gameServers.map((gameServer, index) => (
        <GameServerHouse key={gameServer.uuid} gameServer={gameServer} style={getStyle(index)} />
      ))}
      {authorized && canCreateGameServers && (
        <ConstructionPlaceHouse style={getStyle(props.gameServers.length)} />
      )}
    </div>
  );
};

export default GameServerHouseAligner;
