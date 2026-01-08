export type FormState = {
  identifier: string;
  password: string;
};

export type ErrorsState = FormState;

export type Role = "admin" | "user";

export type ToastKind = "success" | "error" | "info" | "danger";
export type ToastPayload = { type: ToastKind; text: string; id: number };