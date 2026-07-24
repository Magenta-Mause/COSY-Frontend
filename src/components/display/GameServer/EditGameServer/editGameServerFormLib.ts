import { parse as parseCommand } from "shell-quote";
import type { GameServerDto, GameServerUpdateDto } from "@/api/generated/model";
import { cpuLimitValidator } from "@/lib/validators/cpuLimitValidator.ts";
import { memoryLimitValidator } from "@/lib/validators/memoryLimitValidator.ts";
import { portValidator } from "@/lib/validators/portValidator.ts";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import { processEscapeSequences } from "../CreateGameServer/util";

export interface AnnotationEntry {
  readonly key: string;
  readonly value: string;
}

export interface EditFieldLimits {
  readonly cpuLimit: number | null;
  readonly memoryLimit: string | null;
}

/** Annotations are a Record<string,string> on the DTO but edited as key/value entries. */
export const annotationsToEntries = (
  annotations?: Record<string, string>,
): { key: string; value: string }[] =>
  Object.entries(annotations ?? {}).map(([key, value]) => ({ key, value }));

/**
 * Converts annotation entries back to the DTO's Record<string,string> (trimmed key wins on dupes).
 * Values are run through processEscapeSequences, matching the confirm payload semantics.
 */
export const entriesToAnnotationsRecord = (
  entries: readonly AnnotationEntry[],
): Record<string, string> =>
  entries.reduce<Record<string, string>>((acc, entry) => {
    const key = entry.key?.trim();
    if (key) acc[key] = processEscapeSequences(entry.value ?? "");
    return acc;
  }, {});

const parseExecutionCommand = (executionCommandRaw: string): string[] =>
  executionCommandRaw.trim()
    ? parseCommand(executionCommandRaw).filter((x): x is string => typeof x === "string")
    : [];

/**
 * The complete allFieldsValid derivation EXCEPT the cpuError/memoryError component-state
 * checks (the form hook combines those in).
 */
export const areEditFieldsValid = (
  state: GameServerUpdateDto,
  limits: EditFieldLimits,
): boolean => {
  const { cpuLimit, memoryLimit } = limits;

  const serverNameValid = requiredStringValidator.safeParse(state.server_name).success;
  const gameUuidValid = true;
  const dockerImageNameValid = requiredStringValidator.safeParse(state.docker_image_name).success;
  const dockerImageTagValid = requiredStringValidator.safeParse(state.docker_image_tag).success;

  const portMappingsValid =
    !state.port_mappings ||
    state.port_mappings.length === 0 ||
    state.port_mappings.every((mapping) => {
      if (!mapping.container_port && !mapping.instance_port && mapping.protocol) return true;
      const keyValid = portValidator.safeParse(Number(mapping.instance_port)).success;
      const valueValid = portValidator.safeParse(Number(mapping.container_port)).success;
      const protocolValid = !!mapping.protocol;
      return keyValid && valueValid && protocolValid;
    });

  const envVarsValid =
    !state.environment_variables ||
    state.environment_variables.length === 0 ||
    state.environment_variables.every((env) => {
      if (!env.key && !env.value) return true;
      const keyValid = requiredStringValidator.safeParse(env.key).success;
      const valueValid = requiredStringValidator.safeParse(env.value).success;
      return keyValid && valueValid;
    });

  const volumeMountsValid =
    !state.volume_mounts ||
    state.volume_mounts.length === 0 ||
    state.volume_mounts.every((vol) => {
      const trimmed = vol.container_path?.trim() ?? "";
      if (trimmed.length === 0) return true;
      if (!trimmed.startsWith("/")) return false;
      if (trimmed === "/") return false;
      return true;
    });

  const hostVolumeMountsValid =
    !state.host_volume_mounts ||
    state.host_volume_mounts.length === 0 ||
    state.host_volume_mounts.every((m) => {
      const host = m.host_path?.trim() ?? "";
      const container = m.container_path?.trim() ?? "";
      if (host.length === 0 && container.length === 0) return true;
      if (host.length === 0) return false;
      return /^\/.+/.test(container);
    });

  const cpuLimitValid =
    cpuLimit === null
      ? // Optional: empty is valid, but provided values must be validated
        state.docker_hardware_limits?.docker_max_cpu_cores === undefined ||
        state.docker_hardware_limits?.docker_max_cpu_cores === null ||
        cpuLimitValidator.safeParse(state.docker_hardware_limits?.docker_max_cpu_cores).success
      : // Required: must have value AND be valid
        state.docker_hardware_limits?.docker_max_cpu_cores !== undefined &&
        state.docker_hardware_limits?.docker_max_cpu_cores !== null &&
        cpuLimitValidator.safeParse(state.docker_hardware_limits?.docker_max_cpu_cores).success;

  const memoryLimitValid =
    memoryLimit === null ||
    (state.docker_hardware_limits?.docker_memory_limit !== undefined &&
      state.docker_hardware_limits?.docker_memory_limit !== null &&
      state.docker_hardware_limits?.docker_memory_limit !== "" &&
      memoryLimitValidator.safeParse(state.docker_hardware_limits?.docker_memory_limit).success);

  return (
    serverNameValid &&
    gameUuidValid &&
    dockerImageNameValid &&
    dockerImageTagValid &&
    portMappingsValid &&
    envVarsValid &&
    volumeMountsValid &&
    hostVolumeMountsValid &&
    cpuLimitValid &&
    memoryLimitValid
  );
};

/** The isChanged derivation: true when the edited state differs from the original server. */
export const isGameServerChanged = (
  state: GameServerUpdateDto,
  original: GameServerDto,
  executionCommandRaw: string,
  annotationEntries: readonly AnnotationEntry[],
): boolean => {
  const parsedCommand = parseExecutionCommand(executionCommandRaw);
  const commandsChanged =
    parsedCommand.length !== (original.execution_command?.length ?? 0) ||
    parsedCommand.some((c, i) => c !== original.execution_command?.[i]);

  const fieldsChanged =
    state.server_name !== original.server_name ||
    state.docker_image_name !== original.docker_image_name ||
    state.docker_image_tag !== original.docker_image_tag;

  const portsChanged =
    JSON.stringify(state.port_mappings ?? []) !== JSON.stringify(original.port_mappings ?? []);

  const envChanged =
    JSON.stringify(state.environment_variables ?? []) !==
    JSON.stringify(original.environment_variables ?? []);

  const volumesChanged =
    JSON.stringify(
      state.volume_mounts?.map((v) => ({
        container_path: v.container_path ?? "",
      })) ?? [],
    ) !==
    JSON.stringify(
      original.volume_mounts?.map((v) => ({
        container_path: v.container_path ?? "",
      })) ?? [],
    );

  const hostVolumesChanged =
    JSON.stringify(
      state.host_volume_mounts?.map((m) => ({
        host_path: m.host_path ?? "",
        container_path: m.container_path ?? "",
        read_only: m.read_only ?? true,
      })) ?? [],
    ) !==
    JSON.stringify(
      original.host_volume_mounts?.map((m) => ({
        host_path: m.host_path ?? "",
        container_path: m.container_path ?? "",
        read_only: m.read_only ?? true,
      })) ?? [],
    );

  const annotationsChanged =
    JSON.stringify(
      annotationEntries
        .filter((e) => e.key?.trim())
        .reduce<Record<string, string>>((acc, e) => {
          acc[e.key.trim()] = e.value ?? "";
          return acc;
        }, {}),
    ) !== JSON.stringify(original.annotations ?? {});

  const normalizeLimitValue = (val: string | number | null | undefined) =>
    val === null || val === undefined || val === "" ? null : val;

  const hardwareLimitsChanged =
    normalizeLimitValue(state.docker_hardware_limits?.docker_max_cpu_cores) !==
      normalizeLimitValue(original.docker_hardware_limits?.docker_max_cpu_cores) ||
    normalizeLimitValue(state.docker_hardware_limits?.docker_memory_limit) !==
      normalizeLimitValue(original.docker_hardware_limits?.docker_memory_limit);

  return (
    commandsChanged ||
    fieldsChanged ||
    portsChanged ||
    envChanged ||
    volumesChanged ||
    hostVolumesChanged ||
    annotationsChanged ||
    hardwareLimitsChanged
  );
};

/** Assembles the GameServerUpdateDto payload sent on confirm from the edited form state. */
export const buildUpdatePayload = (
  state: GameServerUpdateDto,
  executionCommandRaw: string,
  annotationEntries: readonly AnnotationEntry[],
): GameServerUpdateDto => ({
  ...state,
  execution_command: parseExecutionCommand(executionCommandRaw),
  port_mappings: state.port_mappings?.filter((p) => p.instance_port || p.container_port),
  environment_variables: state.environment_variables
    ?.filter((env) => env.key?.trim() || env.value?.trim())
    .map((env) => ({
      ...env,
      value: processEscapeSequences(env.value),
    })),
  volume_mounts: state.volume_mounts
    ?.filter((vol) => vol.container_path?.trim())
    .map((v) => ({
      container_path: v.container_path,
      ...(v.uuid ? { uuid: v.uuid } : {}),
    })),
  host_volume_mounts: state.host_volume_mounts
    ?.filter((m) => m.host_path?.trim() && m.container_path?.trim())
    .map((m) => ({
      host_path: m.host_path,
      container_path: m.container_path,
      read_only: m.read_only ?? true,
      ...(m.uuid ? { uuid: m.uuid } : {}),
    })),
  annotations: entriesToAnnotationsRecord(annotationEntries),
});
