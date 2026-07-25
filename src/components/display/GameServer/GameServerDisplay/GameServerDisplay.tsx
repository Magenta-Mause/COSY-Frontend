import DekoAssetsAligner from "@/components/display/DekoAssetsAligner/DekoAssetsAligner";
import GameServerHouseAligner from "@/components/display/GameServer/GameServerHouseAligner/GameServerHouseAligner.tsx";
import type { GameServerDto } from "@/api/generated/model";

const GameServerDisplay = (props: { gameServerConfigurations: GameServerDto[] }) => {
  return (
    <div className={"w-full"}>
      <GameServerHouseAligner gameServers={props.gameServerConfigurations} />
      <DekoAssetsAligner gameServers={props.gameServerConfigurations} />
    </div>
  );
};

export default GameServerDisplay;
