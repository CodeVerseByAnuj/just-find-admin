import { z } from "zod";

export const CompilerSchema = z.object({
  source_code: z.string(),
  language_id: z.number(),
  stdin: z.string().optional(),
});

export type CompilerSchemaType = z.infer<typeof CompilerSchema>;