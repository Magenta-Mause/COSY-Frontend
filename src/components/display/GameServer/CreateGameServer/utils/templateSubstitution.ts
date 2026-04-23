import {
  type EnvironmentVariableConfiguration,
  type PortMapping,
  PortMappingProtocol,
  type TemplateEntity,
} from "@/api/generated/model";
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
    const placeholder = new RegExp(`{{${key}}}`, "g");
    result = result.replace(placeholder, String(value));
  }

  return result;
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

  // Substitute port mappings
  if (template.port_mappings) {
    const portMappings: PortMapping[] = [];
    for (const [key, value] of Object.entries(template.port_mappings)) {
      // Parse the key which might be "25565" or "25565/tcp"
      const [portStr, protocol] = key.split("/");

      portMappings.push({
        instance_port: parseInt(substituteVariables(portStr, variables), 10),
        container_port:
          typeof value === "number"
            ? value
            : parseInt(substituteVariables(String(value), variables), 10),
        protocol:
          protocol?.toUpperCase() === "UDP" ? PortMappingProtocol.UDP : PortMappingProtocol.TCP,
      });
    }
    newState.port_mappings = portMappings;
  }

  // Substitute execution command and join to a single string for the form input
  if (template.docker_execution_command) {
    newState.execution_command = template.docker_execution_command
      .map((cmd) => substituteVariables(cmd, variables))
      .join(" ") as unknown as string[];
  }

  // File mounts (volume mounts) - convert to VolumeMountConfigurationCreationDto format
  if (template.file_mounts) {
    newState.volume_mounts = template.file_mounts.map((path) => ({
      container_path: substituteVariables(path, variables),
    }));
  }

  // Apply hardware limits - convert to form state format (strings) with variable substitution
  if (template.resource_limit?.cpu !== undefined) {
    newState.docker_max_cpu = substituteVariables(String(template.resource_limit.cpu), variables);
  }

  if (template.resource_limit?.memory !== undefined) {
    newState.docker_max_memory = substituteVariables(
      String(template.resource_limit.memory),
      variables,
    );
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
