import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TemplateEntity } from "@/api/generated/model";
import useCreationFormState from "./useCreationFormState.ts";

const makeTemplate = (overrides: Partial<TemplateEntity> = {}): TemplateEntity => ({
  uuid: "tpl-1",
  name: "Test Template",
  description: "",
  game_id: "1",
  variables: [],
  tags: [],
  ...overrides,
});

describe("useCreationFormState", () => {
  it("initializes with a random valid design and no unsaved changes", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    expect(["HOUSE", "CASTLE"]).toContain(result.current.creationState.gameServerState.design);
    expect(result.current.creationState.utilState).toEqual({});
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("setGameServerState updates a field and flags unsaved changes", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    act(() => {
      result.current.setGameServerState("docker_image_name")("nginx");
    });
    expect(result.current.creationState.gameServerState.docker_image_name).toBe("nginx");
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("does not flag unsaved changes for the design field alone", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    act(() => {
      result.current.setGameServerState("design")("CASTLE");
    });
    expect(result.current.creationState.gameServerState.design).toBe("CASTLE");
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("selectTemplate stores the template and can apply substituted values immediately", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    const template = makeTemplate({ docker_image_name: "minecraft:{{version}}" });
    act(() => {
      result.current.selectTemplate(template, { version: "1.20" }, true);
    });
    expect(result.current.creationState.utilState.selectedTemplate).toEqual(template);
    expect(result.current.creationState.utilState.templateApplied).toBe(true);
    expect(result.current.creationState.gameServerState.docker_image_name).toBe("minecraft:1.20");
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("clearTemplate wipes the selected template and its variables", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    act(() => {
      result.current.selectTemplate(makeTemplate(), { foo: "bar" }, false);
    });
    expect(result.current.creationState.utilState.selectedTemplate).not.toBeNull();

    act(() => {
      result.current.clearTemplate();
    });
    expect(result.current.creationState.utilState.selectedTemplate).toBeNull();
    expect(result.current.creationState.utilState.templateVariables).toEqual({});
    expect(result.current.creationState.utilState.templateApplied).toBe(false);
  });

  it("resetCreationState returns to an empty creation state", () => {
    const { result } = renderHook(() => useCreationFormState(true));
    act(() => {
      result.current.setGameServerState("docker_image_name")("nginx");
      result.current.selectTemplate(makeTemplate(), {}, false);
    });
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.resetCreationState();
    });
    expect(result.current.creationState.gameServerState.docker_image_name).toBeUndefined();
    expect(result.current.creationState.utilState).toEqual({});
    expect(result.current.hasUnsavedChanges).toBe(false);
  });
});
