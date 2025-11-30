import type {GameServerConfigurationEntity} from "@/api/generated/model";
import {cn} from "@/lib/utils.ts";
import type {CSSProperties} from "react";
import serverHouseImage from "@/assets/ai-generated/main-page/house.png";
import GameSign from "@components/display/GameServerConfiguration/GameSign/GameSign.tsx";

const GameServerConfigurationHouse = (props: {
    gameServer: GameServerConfigurationEntity,
    className?: string,
    style?: CSSProperties
}) => {

    return <a
        className={cn("block w-[14%] h-auto aspect-square select-none", props.className)}
        href={`/game-server-configuration/${props.gameServer.uuid}`}
        aria-label={`Game Server Configuration: ${props.gameServer.server_name}`}
        style={props.style}>
        <img
            alt={`Game Server Configuration: ${props.gameServer.server_name}`}
            className="w-full h-full object-cover"
            aria-label={`Game Server Configuration: ${props.gameServer.server_name}`}
            src={serverHouseImage}/>
        <GameSign className="bottom-[-2%] right-[5%] w-[25%]" classNameTextChildren="!text-[.5vw]">
            {props.gameServer.server_name}
        </GameSign>
    </a>
}

export default GameServerConfigurationHouse;
