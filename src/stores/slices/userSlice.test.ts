import { describe, expect, it } from "vitest";
import type { UserEntityDto } from "@/api/generated/model";
import { userSliceActions, userSliceReducer } from "@/stores/slices/userSlice.ts";

const makeUser = (uuid: string, name: string): UserEntityDto =>
  ({ uuid, username: name }) as UserEntityDto;

const initialState = userSliceReducer(undefined, { type: "@@INIT" });

describe("userSlice", () => {
  it("starts idle with an empty list", () => {
    expect(initialState).toEqual({ data: [], state: "idle" });
  });

  it("setUsers replaces the whole list", () => {
    const users = [makeUser("a", "alice"), makeUser("b", "bob")];
    const next = userSliceReducer(initialState, userSliceActions.setUsers(users));
    expect(next.data).toEqual(users);
  });

  it("addUser appends to the existing list", () => {
    const start = userSliceReducer(
      initialState,
      userSliceActions.setUsers([makeUser("a", "alice")]),
    );
    const next = userSliceReducer(start, userSliceActions.addUser(makeUser("b", "bob")));
    expect(next.data.map((u) => u.uuid)).toEqual(["a", "b"]);
  });

  it("updateUser replaces the matching user and ignores unknown uuids", () => {
    const start = userSliceReducer(
      initialState,
      userSliceActions.setUsers([makeUser("a", "alice"), makeUser("b", "bob")]),
    );
    const updated = userSliceReducer(
      start,
      userSliceActions.updateUser(makeUser("a", "alice-renamed")),
    );
    expect(updated.data.find((u) => u.uuid === "a")?.username).toBe("alice-renamed");

    const noop = userSliceReducer(start, userSliceActions.updateUser(makeUser("z", "ghost")));
    expect(noop.data).toEqual(start.data);
  });

  it("removeUser drops the matching user by uuid", () => {
    const start = userSliceReducer(
      initialState,
      userSliceActions.setUsers([makeUser("a", "alice"), makeUser("b", "bob")]),
    );
    const next = userSliceReducer(start, userSliceActions.removeUser("a"));
    expect(next.data.map((u) => u.uuid)).toEqual(["b"]);
  });

  it("resetUsers empties the list", () => {
    const start = userSliceReducer(
      initialState,
      userSliceActions.setUsers([makeUser("a", "alice")]),
    );
    const next = userSliceReducer(start, userSliceActions.resetUsers());
    expect(next.data).toEqual([]);
  });

  it("setState transitions the loading state", () => {
    const next = userSliceReducer(initialState, userSliceActions.setState("loading"));
    expect(next.state).toBe("loading");
  });
});
