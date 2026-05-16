import type { Component } from "vue";

export type DialogMode = "confirm" | "prompt" | "custom" | null;

export type DialogExpose = {
  confirm: (text: string) => Promise<boolean>;
  open: () => void;
  close: () => void;
  prompt: (text: string) => void;
  custom: (component: Component, model?: any, props?: any) => void;
};
