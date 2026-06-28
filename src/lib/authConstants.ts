/** Roles allowed to add/edit/remove host mounts. Mirrors backend `user.isAdmin()` gating. */
export const HOST_MOUNT_EDITABLE_ROLES: readonly string[] = ["ADMIN", "OWNER"];
