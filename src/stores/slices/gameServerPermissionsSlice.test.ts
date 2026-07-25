import { describe, expect, it } from "vitest";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import {
  gameServerPermissionsSliceActions,
  gameServerPermissionsSliceReducer,
} from "@/stores/slices/gameServerPermissionsSlice.ts";

const SEE_SERVER = GameServerAccessGroupDtoPermissionsItem.SEE_SERVER;
const START_STOP = GameServerAccessGroupDtoPermissionsItem.START_STOP_SERVER;

const initialState = gameServerPermissionsSliceReducer(undefined, { type: "@@INIT" });

describe("gameServerPermissionsSlice", () => {
  it("starts with an empty permission map", () => {
    expect(initialState).toEqual({ data: {} });
  });

  it("setGameServerPermissions stores permissions keyed by server uuid and marks it idle", () => {
    const next = gameServerPermissionsSliceReducer(
      initialState,
      gameServerPermissionsSliceActions.setGameServerPermissions({
        gameServerUuid: "srv-1",
        permissions: [SEE_SERVER, START_STOP],
      }),
    );
    expect(next.data["srv-1"]).toEqual({ permissions: [SEE_SERVER, START_STOP], state: "idle" });
  });

  it("updateGameServerPermissionsStatus updates the status of an existing entry", () => {
    const start = gameServerPermissionsSliceReducer(
      initialState,
      gameServerPermissionsSliceActions.setGameServerPermissions({
        gameServerUuid: "srv-1",
        permissions: [SEE_SERVER],
      }),
    );
    const next = gameServerPermissionsSliceReducer(
      start,
      gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
        gameServerUuid: "srv-1",
        status: "loading",
      }),
    );
    expect(next.data["srv-1"]).toEqual({ permissions: [SEE_SERVER], state: "loading" });
  });

  it("updateGameServerPermissionsStatus seeds a blank entry for an unknown server", () => {
    const next = gameServerPermissionsSliceReducer(
      initialState,
      gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
        gameServerUuid: "srv-new",
        status: "failed",
      }),
    );
    expect(next.data["srv-new"]).toEqual({ permissions: [], state: "failed" });
  });

  it("removeGameServerPermissions deletes the entry", () => {
    const start = gameServerPermissionsSliceReducer(
      initialState,
      gameServerPermissionsSliceActions.setGameServerPermissions({
        gameServerUuid: "srv-1",
        permissions: [SEE_SERVER],
      }),
    );
    const next = gameServerPermissionsSliceReducer(
      start,
      gameServerPermissionsSliceActions.removeGameServerPermissions("srv-1"),
    );
    expect(next.data["srv-1"]).toBeUndefined();
  });

  it("resetState clears the whole map", () => {
    const start = gameServerPermissionsSliceReducer(
      initialState,
      gameServerPermissionsSliceActions.setGameServerPermissions({
        gameServerUuid: "srv-1",
        permissions: [SEE_SERVER],
      }),
    );
    const next = gameServerPermissionsSliceReducer(
      start,
      gameServerPermissionsSliceActions.resetState(),
    );
    expect(next.data).toEqual({});
  });
});
