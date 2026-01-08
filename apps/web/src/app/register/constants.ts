import type { FormState } from "./types";

export const REGISTER_API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") +
  "/auth/register";

export const ICON_LOGO_URL = "/Logo.svg";
export const ICON_PW_URL = "/pw.svg";
export const ICON_EMAIL_URL = "/email.svg";
export const ICON_USER_URL = "/user.svg";

export const INITIAL_FORM: FormState = {
  email: "",
  username: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
};

export const INITIAL_ERRORS: FormState = {
  email: "",
  username: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
};
