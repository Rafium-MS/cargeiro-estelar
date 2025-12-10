// src/core/services/types.ts
export type ActionResult = { success: true } | { success: false; error: string };

export type StateListener<T> = (state: T) => void;
