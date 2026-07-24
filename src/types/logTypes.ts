import type { GameServerLogMessageEntity } from "@/api/generated/model";

export type GameServerLogWithUuid = GameServerLogMessageEntity & { uuid: string };
