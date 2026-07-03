import { hitesh } from "./hitesh.js";
import { piyush } from "./piyush.js";

export const personas = [hitesh, piyush];
export const personaById = Object.fromEntries(
  personas.map((p) => [p.id, p])
);

export const DEFAULT_PERSONA_ID = hitesh.id;
