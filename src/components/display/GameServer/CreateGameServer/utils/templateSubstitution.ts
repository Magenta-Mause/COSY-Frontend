import {
  type EnvironmentVariableConfiguration,
  type HostVolumeMountConfigurationDto,
  type PortMapping,
  PortMappingProtocol,
  type TemplateEntity,
} from "@/api/generated/model";
import { quote } from "shell-quote";
import type { GameServerCreationFormState } from "../CreateGameServerModal";

/**
 * Substitutes template variables in a string
 * Replaces {{variable_name}} with actual values
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string | number | boolean>,
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const placeholder = new RegExp(`{{${escapedKey}}}`, "g");
    result = result.replace(placeholder, String(value));
  }

  return result;
}

/** True when the (already-substituted) string still carries an unresolved `{{var}}` or is empty. */
function hasUnresolvedOrEmpty(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || trimmed.includes("{{");
}

/**
 * Substitutes variables into a string and coerces it to an integer.
 * Returns undefined when the value is empty, still contains an unresolved `{{var}}`, or is not a
 * finite integer (the field is then omitted to keep a valid creation DTO).
 */
function substituteToInt(
  template: string,
  variables: Record<string, string | number | boolean>,
): number | undefined {
  const substituted = substituteVariables(template, variables);
  if (hasUnresolvedOrEmpty(substituted)) return undefined;
  const parsed = Number.parseInt(substituted.trim(), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Substitutes variables into a string and coerces it to a (float) number.
 * Returns undefined when the value is empty, still contains an unresolved `{{var}}`, or is NaN.
 */
function substituteToNumber(
  template: string,
  variables: Record<string, string | number | boolean>,
): number | undefined {
  const substituted = substituteVariables(template, variables);
  if (hasUnresolvedOrEmpty(substituted)) return undefined;
  const parsed = Number.parseFloat(substituted.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Applies a template to the game server creation state
 * Substitutes all variables and returns the updated state
 */
export function applyTemplate(
  template: TemplateEntity,
  variables: Record<string, string | number | boolean>,
  currentState: GameServerCreationFormState,
): GameServerCreationFormState {
  const newState: GameServerCreationFormState = { ...currentState };

  // Substitute docker image name
  if (template.docker_image_name) {
    newState.docker_image_name = substituteVariables(template.docker_image_name, variables);
  }

  // Substitute docker image tag
  if (template.docker_image_tag) {
    newState.docker_image_tag = substituteVariables(template.docker_image_tag, variables);
  }

  // Substitute environment variables
  if (template.environment_variables) {
    const envVars: EnvironmentVariableConfiguration[] = [];
    for (const [key, value] of Object.entries(template.environment_variables)) {
      envVars.push({
        key: substituteVariables(key, variables),
        value: substituteVariables(value, variables),
      });
    }
    newState.environment_variables = envVars;
  }

  // Substitute port mappings. Port values are now STRINGS that may contain {{var}}; substitute
  // first, then coerce to int. Skip any mapping whose port stays unresolved/empty/non-numeric.
  if (template.port_mappings) {
    const portMappings: PortMapping[] = [];
    for (const [key, value] of Object.entries(template.port_mappings)) {
      // Parse the key which might be "25565" or "25565/tcp"
      const [portStr, protocol] = key.split("/");

      const instancePort = substituteToInt(portStr, variables);
      const containerPort = substituteToInt(String(value), variables);

      // Both ports must resolve to a valid integer to form a usable mapping.
      if (instancePort === undefined || containerPort === undefined) continue;

      portMappings.push({
        instance_port: instancePort,
        container_port: containerPort,
        protocol:
          protocol?.toUpperCase() === "UDP" ? PortMappingProtocol.UDP : PortMappingProtocol.TCP,
      });
    }
    newState.port_mappings = portMappings;
  }

  // Substitute execution command. Use shell-quote so tokens containing spaces survive the
  // parseCommand round-trip in handleConfirmCreate without being split into extra tokens.
  if (template.docker_execution_command) {
    const substituted = template.docker_execution_command.map((cmd) =>
      substituteVariables(cmd, variables),
    );
    newState.execution_command = quote(substituted) as unknown as string[];
  }

  // File mounts (volume mounts) - convert to VolumeMountConfigurationCreationDto format.
  // Skip paths that remain unresolved after substitution to keep the DTO valid.
  if (template.file_mounts) {
    const volumeMounts = [];
    for (const path of template.file_mounts) {
      const containerPath = substituteVariables(path, variables);
      if (hasUnresolvedOrEmpty(containerPath)) continue;
      volumeMounts.push({ container_path: containerPath });
    }
    newState.volume_mounts = volumeMounts;
  }

  // Apply hardware limits - resource_limit values are now STRINGS that may contain {{var}}.
  // Substitute FIRST, then coerce: cpu is a (float) number, memory is parsed/validated and kept
  // as the string the form input expects. Guard against unsubstituted/empty values.
  if (template.resource_limit?.cpu !== undefined) {
    const cpu = substituteToNumber(String(template.resource_limit.cpu), variables);
    newState.docker_max_cpu = cpu !== undefined ? String(cpu) : undefined;
  }

  if (template.resource_limit?.memory !== undefined) {
    const memory = substituteVariables(String(template.resource_limit.memory), variables);
    // Keep the substituted string (memory limits may be like "512" or "2Gi"); omit when unresolved.
    newState.docker_max_memory = hasUnresolvedOrEmpty(memory) ? undefined : memory.trim();
  }

  // Substitute annotations (Docker labels) — both keys and values may contain {{var}}.
  // Stored as key/value entries for the KeyValueInput editor; converted to a record at submit time.
  if (template.annotations) {
    const annotations: { key: string; value: string }[] = [];
    for (const [key, value] of Object.entries(template.annotations)) {
      const substitutedKey = substituteVariables(key, variables).trim();
      const substitutedValue = substituteVariables(String(value), variables);
      // Skip entries where key or value stays unresolved to keep the DTO valid.
      if (hasUnresolvedOrEmpty(substitutedKey) || hasUnresolvedOrEmpty(substitutedValue)) continue;
      annotations.push({ key: substitutedKey, value: substitutedValue });
    }
    newState.annotations = annotations;
  }

  // Substitute host mounts — host_path and container_path may contain {{var}}.
  if (template.host_mounts) {
    const hostMounts: HostVolumeMountConfigurationDto[] = [];
    for (const mount of template.host_mounts) {
      const hostPath = substituteVariables(String(mount.host_path ?? ""), variables).trim();
      const containerPath = substituteVariables(
        String(mount.container_path ?? ""),
        variables,
      ).trim();
      // Require both paths to resolve to a usable value; container_path must be absolute.
      if (hasUnresolvedOrEmpty(hostPath) || hasUnresolvedOrEmpty(containerPath)) continue;
      hostMounts.push({
        host_path: hostPath,
        container_path: containerPath,
        read_only: mount.read_only ?? true,
      });
    }
    newState.host_volume_mounts = hostMounts;
  }

  return newState;
}

/**
 * Validates that all required template variables are filled and valid
 */
export function validateTemplateVariables(
  template: TemplateEntity | null,
  variables: Record<string, string | number | boolean>,
): boolean {
  if (!template || !template.variables || template.variables.length === 0) {
    return true; // No variables to validate
  }

  for (const variable of template.variables) {
    const placeholder = variable.placeholder?.trim();

    // Invalid or missing placeholder means validation fails
    if (!placeholder) {
      return false;
    }
    const value = variables[placeholder];
    const stringValue = value === undefined || value === null ? "" : String(value);

    // All variables must have a non-empty value for substitution to work
    if (stringValue === "") {
      return false;
    }

    // Validate based on type
    switch (variable.type) {
      case "number":
        if (Number.isNaN(Number(stringValue))) {
          return false;
        }
        break;
      case "boolean":
        if (stringValue !== "true" && stringValue !== "false") {
          return false;
        }
        break;
      case "select":
        if (!(variable.options?.includes(stringValue) ?? false)) {
          return false;
        }
        break;
      default:
        // Validate regex if provided (full match)
        if (variable.regex) {
          try {
            const regex = new RegExp(`^(?:${variable.regex})$`);
            if (!regex.test(stringValue)) {
              return false;
            }
          } catch {
            // Invalid regex, skip validation
          }
        }
        break;
    }
  }

  return true;
}
