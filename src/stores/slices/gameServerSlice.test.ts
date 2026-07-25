import { describe, expect, it } from "vitest";
import { type GameServerDto, GameServerDtoStatus } from "@/api/generated/model";
import {
  gameServerSliceActions,
  gameServerSliceReducer,
} from "@/stores/slices/gameServerSlice.ts";

const makeServer = (uuid: string, status: GameServerDtoStatus = GameServerDtoStatus.STOPPED): GameServerDto =>
  ({ uuid, status }) as GameServerDto;

const initialState = gameServerSliceReducer(undefined, { type: "@@INIT" });

describe("gameServerSlice", () => {
  it("starts uninitialized, idle, with empty data and pull progress", () => {
    expect(initialState).toEqual({
      data: [],
      state: "idle",
      initialized: false,
      pullProgress: {},
    });
  });

  it("setGameServers replaces data and flips initialized", () => {
    const servers = [makeServer("a"), makeServer("b")];
    const next = gameServerSliceReducer(initialState, gameServerSliceActions.setGameServers(servers));
    expect(next.initialized).toBe(true);
    expect(next.data).toEqual(servers);
  });

  it("addGameServer appends and marks initialized", () => {
    const next = gameServerSliceReducer(initialState, gameServerSliceActions.addGameServer(makeServer("a")));
    expect(next.initialized).toBe(true);
    expect(next.data.map((s) => s.uuid)).toEqual(["a"]);
  });

  it("updateGameServerStatus changes only the targeted server's status", () => {
    const start = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.setGameServers([makeServer("a"), makeServer("b")]),
    );
    const next = gameServerSliceReducer(
      start,
      gameServerSliceActions.updateGameServerStatus({ uuid: "a", status: GameServerDtoStatus.RUNNING }),
    );
    expect(next.data.find((s) => s.uuid === "a")?.status).toBe(GameServerDtoStatus.RUNNING);
    expect(next.data.find((s) => s.uuid === "b")?.status).toBe(GameServerDtoStatus.STOPPED);
  });

  it("awaitPendingUpdate moves the targeted server into AWAITING_UPDATE", () => {
    const start = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.setGameServers([makeServer("a", GameServerDtoStatus.RUNNING)]),
    );
    const next = gameServerSliceReducer(start, gameServerSliceActions.awaitPendingUpdate("a"));
    expect(next.data[0].status).toBe(GameServerDtoStatus.AWAITING_UPDATE);
  });

  it("updateGameServer replaces an existing server and inserts an unknown one", () => {
    const start = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.setGameServers([makeServer("a", GameServerDtoStatus.RUNNING)]),
    );
    const replaced = gameServerSliceReducer(
      start,
      gameServerSliceActions.updateGameServer(makeServer("a", GameServerDtoStatus.STOPPED)),
    );
    expect(replaced.data).toHaveLength(1);
    expect(replaced.data[0].status).toBe(GameServerDtoStatus.STOPPED);

    const inserted = gameServerSliceReducer(start, gameServerSliceActions.updateGameServer(makeServer("z")));
    expect(inserted.data.map((s) => s.uuid)).toEqual(["a", "z"]);
  });

  it("removeGameServer drops the matching server", () => {
    const start = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.setGameServers([makeServer("a"), makeServer("b")]),
    );
    const next = gameServerSliceReducer(start, gameServerSliceActions.removeGameServer("a"));
    expect(next.data.map((s) => s.uuid)).toEqual(["b"]);
  });

  it("updatePullProgress records progress keyed by server uuid and layer id", () => {
    const next = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.updatePullProgress({
        uuid: "a",
        progress: { id: "layer1", status: "Downloading" },
      }),
    );
    expect(next.pullProgress.a.layer1).toEqual({ id: "layer1", status: "Downloading" });
  });

  it("updatePullProgress falls back to an __unknown__ layer key when id is absent", () => {
    const next = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.updatePullProgress({ uuid: "a", progress: { status: "Extracting" } }),
    );
    expect(next.pullProgress.a.__unknown__).toEqual({ status: "Extracting" });
  });

  it("resetGameServers empties the data list", () => {
    const start = gameServerSliceReducer(
      initialState,
      gameServerSliceActions.setGameServers([makeServer("a")]),
    );
    const next = gameServerSliceReducer(start, gameServerSliceActions.resetGameServers());
    expect(next.data).toEqual([]);
  });
});
