import type { GameServerDto, GameServerUpdateDto } from "@/api/generated/model";

export const mapGameServerDtoToUpdate = (server: GameServerDto): GameServerUpdateDto => ({
  server_name: server.server_name,
  external_game_id: server.external_game_id,
  docker_image_name: server.docker_image_name,
  docker_image_tag: server.docker_image_tag,
  port_mappings: server.port_mappings?.map((pm) => ({
    ...pm,
  })),
  environment_variables: server.environment_variables,
  volume_mounts: server.volume_mounts?.map((v) => ({
    container_path: v.container_path ?? "",
    uuid: v.uuid,
  })),
  host_volume_mounts: server.host_volume_mounts?.map((m) => ({
    host_path: m.host_path ?? "",
    container_path: m.container_path ?? "",
    read_only: m.read_only ?? true,
    uuid: m.uuid,
  })),
  annotations: server.annotations,
  execution_command: server.execution_command,
  docker_hardware_limits: {
    docker_memory_limit: server.docker_hardware_limits?.docker_memory_limit,
    docker_max_cpu_cores: server.docker_hardware_limits?.docker_max_cpu_cores,
  },
});
