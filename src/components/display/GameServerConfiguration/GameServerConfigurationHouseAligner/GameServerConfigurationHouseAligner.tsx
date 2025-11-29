import GameServerConfigurationHouse
  from "@components/display/GameServerConfiguration/GameServerConfigurationHouse/GameServerConfigurationHouse.tsx";
import type {GameServerConfigurationEntity} from "@/api/generated/model";
import calculateCoordinate
  from "@components/display/GameServerConfiguration/GameServerConfigurationHouseAligner/calculateCoordinate.ts";

const GameServerConfigurationHouseAligner = (props: {
  gameServers: GameServerConfigurationEntity[];
}) => {
  const getStyle = (index: number): React.CSSProperties => {
    const {x, y} = calculateCoordinate(index);

    return {
      position: "absolute",
      left: `${x * 100}%`,
      top: `${y}px`,
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
    </div>
  );
};


export default GameServerConfigurationHouseAligner;