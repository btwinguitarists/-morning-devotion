import { z } from "zod";

// The app is purely local-first using IndexedDB (Dexie).
// This is a minimal schema to satisfy template requirements.
export const dummySchema = z.object({
  id: z.number(),
});
