import type { Ref } from "vue";

export type ContextMenuType = {
  context: Node | string | null;
  items: ContextMenuItemType[];
  show: boolean;
  strict: boolean;
};

export type ContextMenuItemType = ContextMenuItemAction | ContextMenuItemSubmenu | ContextMenuItemCheckbox | ContextMenuItemOption | ContextMenuItemSeperator;

export type ContextMenuItemAction = {
  type: "action";
  label: string;
  action: () => void;
};
export type ContextMenuItemSubmenu = {
  type: "submenu";
  label: string;
  submenu: Exclude<ContextMenuItemType, ContextMenuItemSubmenu>[];
};
export type ContextMenuItemCheckbox = {
  type: "checkbox";
  label: string;
  value: Ref<boolean> | boolean;
};
export type ContextMenuItemOption = {
  type: "option";
  label: string;
  value: string;
  model: Ref<string> | string;
};
export type ContextMenuItemSeperator = {
  type: "separator";
};

export interface ContextMenuExposed {
  register: (items: ContextMenuItemType[], context?: Node | string | null, strict?: boolean) => void;
  isOpen: Ref<boolean>;
}
