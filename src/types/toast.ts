export type ToastProps = {
  default_timeout?: number;
  interval?: number;
  position?: ToastPosition;
};

export type ToastPosition = "top_left" | "top_center" | "top_right" | "center_left" | "center_center" | "center_right" | "bottom_right" | "bottom_left" | "bottom_center";
export type ToastExpose = {
  add: (text: string, timeout?: number) => void;
};

export type ToastType = {
  text: string;
  timeout: number;
};
