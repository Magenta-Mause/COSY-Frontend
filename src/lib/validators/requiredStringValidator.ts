import * as z from "zod";

export const requiredStringValidator = z.string().min(1);
