import { quote } from "shell-quote";
import { describe, expect, it } from "vitest";
import {
  type GameServerDto,
  type GameServerUpdateDto,
  PortMappingProtocol,
} from "@/api/generated/model";
import { mapGameServerDtoToUpdate } from "@/lib/gameServerMapper.ts";
import {
  type AnnotationEntry,
  annotationsToEntries,
  areEditFieldsValid,
  buildUpdatePayload,
  entriesToAnnotationsRecord,
  isGameServerChanged,
} from "./editGameServerFormLib.ts";

const makeUpdate = (overrides: Partial<GameServerUpdateDto> = {}): GameServerUpdateDto => ({
  server_name: "srv",
  docker_image_name: "nginx",
  docker_image_tag: "latest",
  ...overrides,
});

const makeOriginal = (overrides: Partial<GameServerDto> = {}): GameServerDto =>
  ({
    server_name: "srv",
    docker_image_name: "nginx",
    docker_image_tag: "latest",
    port_mappings: [],
    environment_variables: [],
    volume_mounts: [],
    host_volume_mounts: [],
    annotations: {},
    execution_command: [],
    docker_hardware_limits: {},
    ...overrides,
  }) as unknown as GameServerDto;

const richOriginal = makeOriginal({
  execution_command: ["./run.sh", "--x"],
  port_mappings: [
    { instance_port: 25565, container_port: 25565, protocol: PortMappingProtocol.TCP },
  ],
  environment_variables: [{ key: "K", value: "V" }],
  volume_mounts: [{ container_path: "/data", uuid: "u1" }],
  host_volume_mounts: [{ host_path: "/h", container_path: "/c", read_only: true, uuid: "h1" }],
  annotations: { "com.x": "1" },
  docker_hardware_limits: { docker_max_cpu_cores: 2, docker_memory_limit: "512MiB" },
});

describe("annotationsToEntries", () => {
  it("maps a record into key/value entries and defaults undefined to empty", () => {
    expect(annotationsToEntries({ a: "1", b: "2" })).toEqual([
      { key: "a", value: "1" },
      { key: "b", value: "2" },
    ]);
    expect(annotationsToEntries(undefined)).toEqual([]);
  });
});

describe("entriesToAnnotationsRecord", () => {
  it("trims keys, drops blank keys, and lets a later trimmed-key win", () => {
    const entries: AnnotationEntry[] = [
      { key: "  a  ", value: "first" },
      { key: "a", value: "second" },
      { key: "   ", value: "ignored" },
      { key: "b", value: "keep" },
    ];
    expect(entriesToAnnotationsRecord(entries)).toEqual({ a: "second", b: "keep" });
  });

  it("applies escape-sequence processing to values", () => {
    expect(entriesToAnnotationsRecord([{ key: "k", value: "line1\\nline2\\ttab" }])).toEqual({
      k: "line1\nline2\ttab",
    });
  });
});

describe("areEditFieldsValid", () => {
  const noLimits = { cpuLimit: null, memoryLimit: null };

  it("accepts a minimal valid state when limits are optional", () => {
    expect(areEditFieldsValid(makeUpdate(), noLimits)).toBe(true);
  });

  it("rejects a port mapping with an out-of-range port", () => {
    const state = makeUpdate({
      port_mappings: [{ instance_port: 99999, container_port: 8080, protocol: PortMappingProtocol.TCP }],
    });
    expect(areEditFieldsValid(state, noLimits)).toBe(false);
  });

  it("rejects a half-filled environment variable", () => {
    const state = makeUpdate({ environment_variables: [{ key: "K", value: "" }] });
    expect(areEditFieldsValid(state, noLimits)).toBe(false);
  });

  it("rejects a relative volume mount path", () => {
    const state = makeUpdate({ volume_mounts: [{ container_path: "data" }] });
    expect(areEditFieldsValid(state, noLimits)).toBe(false);
  });

  it("requires a cpu value when a cpu limit is enforced", () => {
    const withLimit = { cpuLimit: 2, memoryLimit: null };
    expect(areEditFieldsValid(makeUpdate(), withLimit)).toBe(false);
    const state = makeUpdate({ docker_hardware_limits: { docker_max_cpu_cores: 1 } });
    expect(areEditFieldsValid(state, withLimit)).toBe(true);
  });

  it("allows an empty cpu value when there is no cpu limit", () => {
    expect(areEditFieldsValid(makeUpdate(), noLimits)).toBe(true);
  });

  it("requires a memory value when a memory limit is enforced", () => {
    const withLimit = { cpuLimit: null, memoryLimit: "1024MiB" };
    expect(areEditFieldsValid(makeUpdate(), withLimit)).toBe(false);
    const state = makeUpdate({ docker_hardware_limits: { docker_memory_limit: "512MiB" } });
    expect(areEditFieldsValid(state, withLimit)).toBe(true);
  });
});

describe("isGameServerChanged", () => {
  const baseState = mapGameServerDtoToUpdate(richOriginal);
  const baseRaw = quote(baseState.execution_command ?? []);
  const baseEntries = annotationsToEntries(baseState.annotations);

  it("returns false when nothing changed", () => {
    expect(isGameServerChanged(baseState, richOriginal, baseRaw, baseEntries)).toBe(false);
  });

  it("detects a server name change", () => {
    expect(
      isGameServerChanged({ ...baseState, server_name: "other" }, richOriginal, baseRaw, baseEntries),
    ).toBe(true);
  });

  it("detects a docker image change", () => {
    expect(
      isGameServerChanged(
        { ...baseState, docker_image_name: "redis" },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });

  it("detects an execution command reorder", () => {
    expect(isGameServerChanged(baseState, richOriginal, "--x ./run.sh", baseEntries)).toBe(true);
  });

  it("detects a port mapping change", () => {
    expect(
      isGameServerChanged(
        {
          ...baseState,
          port_mappings: [{ instance_port: 1, container_port: 1, protocol: PortMappingProtocol.TCP }],
        },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });

  it("detects an environment variable change", () => {
    expect(
      isGameServerChanged(
        { ...baseState, environment_variables: [{ key: "K", value: "OTHER" }] },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });

  it("detects a volume mount change", () => {
    expect(
      isGameServerChanged(
        { ...baseState, volume_mounts: [{ container_path: "/other" }] },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });

  it("detects a host volume mount change", () => {
    expect(
      isGameServerChanged(
        {
          ...baseState,
          host_volume_mounts: [{ host_path: "/h2", container_path: "/c", read_only: true }],
        },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });

  it("detects an annotation change", () => {
    expect(
      isGameServerChanged(baseState, richOriginal, baseRaw, [{ key: "com.x", value: "2" }]),
    ).toBe(true);
  });

  it("detects a hardware limit change", () => {
    expect(
      isGameServerChanged(
        {
          ...baseState,
          docker_hardware_limits: { docker_max_cpu_cores: 4, docker_memory_limit: "512MiB" },
        },
        richOriginal,
        baseRaw,
        baseEntries,
      ),
    ).toBe(true);
  });
});

describe("buildUpdatePayload", () => {
  it("filters empty entries, parses the command, and maps annotations", () => {
    const state = makeUpdate({
      port_mappings: [
        { instance_port: 25565, container_port: 25565, protocol: PortMappingProtocol.TCP },
        { protocol: PortMappingProtocol.TCP },
      ],
      environment_variables: [
        { key: "K", value: "a\\nb" },
        { key: "", value: "" },
      ],
      volume_mounts: [
        { container_path: "/data", uuid: "u1" },
        { container_path: "   " },
      ],
      host_volume_mounts: [
        { host_path: "/h", container_path: "/c", read_only: false, uuid: "h1" },
        { host_path: "  ", container_path: "  " },
      ],
    });

    const payload = buildUpdatePayload(state, "./run.sh --flag", [
      { key: "  a  ", value: "x\\t" },
      { key: "a", value: "y" },
    ]);

    expect(payload.execution_command).toEqual(["./run.sh", "--flag"]);
    expect(payload.port_mappings).toEqual([
      { instance_port: 25565, container_port: 25565, protocol: PortMappingProtocol.TCP },
    ]);
    expect(payload.environment_variables).toEqual([{ key: "K", value: "a\nb" }]);
    expect(payload.volume_mounts).toEqual([{ container_path: "/data", uuid: "u1" }]);
    expect(payload.host_volume_mounts).toEqual([
      { host_path: "/h", container_path: "/c", read_only: false, uuid: "h1" },
    ]);
    expect(payload.annotations).toEqual({ a: "y" });
  });

  it("produces an empty command array for a blank raw string", () => {
    expect(buildUpdatePayload(makeUpdate(), "   ", []).execution_command).toEqual([]);
  });
});
