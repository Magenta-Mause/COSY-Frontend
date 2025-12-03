import GameServerConfigurationHouseAligner from "@components/display/GameServerConfiguration/GameServerConfigurationHouseAligner/GameServerConfigurationHouseAligner.tsx";
import type { GameServerConfigurationEntity } from "@/api/generated/model";

const GameServerDisplay = (props: {
  gameServerConfigurations: GameServerConfigurationEntity[];
}) => {
  return (
    <div className={"w-full h-full"}>
      <GameServerConfigurationHouseAligner gameServers={props.gameServerConfigurations} />
    </div>
  );
};

export default GameServerDisplay;
