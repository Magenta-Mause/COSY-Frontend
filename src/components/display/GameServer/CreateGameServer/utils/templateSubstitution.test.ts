import { describe, expect, it } from "vitest";
import type { TemplateEntity } from "@/api/generated/model";
import type { GameServerCreationFormState } from "../context.ts";
import { processEscapeSequences } from "./inputValue.ts";
import { applyTemplate, substituteVariables } from "./templateSubstitution.ts";

const emptyState: GameServerCreationFormState = {};

const applyEnv = (
  environment_variables: Record<string, string>,
  variables: Record<string, string | number | boolean> = {},
) =>
  applyTemplate({ environment_variables } as TemplateEntity, variables, emptyState)
    .environment_variables ?? [];

/** What handleConfirmCreate does to a value on its way to the API. */
const submit = (value: string) => processEscapeSequences(value);

describe("substituteVariables", () => {
  it("replaces every occurrence of a placeholder", () => {
    expect(substituteVariables("{{a}}-{{a}}-{{b}}", { a: "1", b: "2" })).toBe("1-1-2");
  });

  it("leaves an unknown placeholder in place", () => {
    expect(substituteVariables("{{a}}-{{unknown}}", { a: "1" })).toBe("1-{{unknown}}");
  });
});

describe("applyTemplate environment variables", () => {
  it("copies authored escape notation through verbatim", () => {
    // The form edits escape notation and processes it once at submit time; a template value is
    // already in that notation, so applyTemplate must not escape it a second time.
    expect(applyEnv({ MODRINTH_PROJECTS: "fabric-api\\ncosy-integration-mod" })).toEqual([
      { key: "MODRINTH_PROJECTS", value: "fabric-api\\ncosy-integration-mod" },
    ]);
  });

  it("submits the newline the template author asked for", () => {
    // templates/minecraft/fabric-cosy-integration.yaml — itzg/minecraft-server wants the project
    // list newline-separated, so this has to reach the API as two lines, not a literal backslash-n.
    const [modrinth] = applyEnv({ MODRINTH_PROJECTS: "fabric-api\\ncosy-integration-mod" });
    expect(submit(modrinth.value)).toBe("fabric-api\ncosy-integration-mod");
  });

  it("submits a template backslash pair as a single backslash", () => {
    const [win] = applyEnv({ WIN_PATH: "C:\\\\Users\\\\test" });
    expect(win.value).toBe("C:\\\\Users\\\\test");
    expect(submit(win.value)).toBe("C:\\Users\\test");
  });

  it("substitutes variables in both key and value", () => {
    expect(applyEnv({ "{{name}}_MODE": "{{mode}}\\nverbose" }, { name: "MC", mode: "hard" })).toEqual(
      [{ key: "MC_MODE", value: "hard\\nverbose" }],
    );
  });

  it("leaves values without escape sequences alone", () => {
    const [plain] = applyEnv({ EULA: "TRUE" });
    expect(plain.value).toBe("TRUE");
    expect(submit(plain.value)).toBe("TRUE");
  });
});

describe("applyTemplate annotations", () => {
  const applyAnnotations = (annotations: Record<string, string>) =>
    applyTemplate({ annotations } as TemplateEntity, {}, emptyState).annotations ?? [];

  it("copies authored escape notation through verbatim", () => {
    expect(applyAnnotations({ "com.example.note": "line1\\nline2" })).toEqual([
      { key: "com.example.note", value: "line1\\nline2" },
    ]);
  });

  it("skips entries whose key or value stays unresolved", () => {
    expect(
      applyAnnotations({ "com.example.a": "{{missing}}", "{{missing}}": "value" }),
    ).toEqual([]);
  });
});

describe("applyTemplate is idempotent", () => {
  it("produces the same values when the same template is re-applied", () => {
    const template = {
      environment_variables: {
        MODRINTH_PROJECTS: "fabric-api\\ncosy-integration-mod",
        WIN_PATH: "C:\\\\Users\\\\test",
      },
      annotations: { "com.example.note": "line1\\nline2" },
    } as TemplateEntity;

    const once = applyTemplate(template, {}, emptyState);
    const twice = applyTemplate(template, {}, once);

    expect(twice.environment_variables).toEqual(once.environment_variables);
    expect(twice.annotations).toEqual(once.annotations);
  });
});
