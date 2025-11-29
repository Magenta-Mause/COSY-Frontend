import type {GameServerConfigurationEntity} from "@/api/generated/model";
import {cn} from "@/lib/utils.ts";
import type {CSSProperties} from "react";
import serverHouseImage from "@/assets/house.png";

const GameServerConfigurationHouse = (props: {
    gameServer: GameServerConfigurationEntity,
    className?: string,
    style?: CSSProperties
}) => {

    return <a
        className={cn("block overflow-hidden w-[10%] h-auto aspect-square border-black border-4 text-xs", props.className)}
        href={`/game-server-configuration/${props.gameServer.uuid}`}
        aria-label={`Game Server Configuration: ${props.gameServer.server_name}`}
        style={props.style}>
        <img
            className="w-full h-full object-cover"
            aria-label={`Game Server Configuration: ${props.gameServer.server_name}`}
            src={serverHouseImage}/>
    </a>
}

export default GameServerConfigurationHouse;