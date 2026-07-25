import * as z from "zod";

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

export const portValidator = z.number().min(PORT_MIN).max(PORT_MAX);

export const coercedPortValidator = z.coerce.number().min(PORT_MIN).max(PORT_MAX);
