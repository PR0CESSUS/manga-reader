import { type WebviewTag } from "electron";

export type WebviewHandlers = {
  "querySelector.innerText.number": (selector: string) => number;
  "querySelector.innerText": (selector: string) => string;
  "querySelector.href": (selector: string) => string;
  "querySelector.toDataURL": (selector: string) => string;
  "querySelector.dataset": (selector: string) => string;
};

export type Channel = keyof WebviewHandlers;
export type WebviewArgs<C extends Channel> = Parameters<WebviewHandlers[C]>;
export type WebviewReturn<C extends Channel> = ReturnType<WebviewHandlers[C]>;

export type HTMLWebviewTag = WebviewTag & {
  sendMessage<C extends Channel>(channel: C, ...args: WebviewArgs<C>): Promise<WebviewReturn<C>>;
};
