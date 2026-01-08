// app/(dashboard)/dashboard/user-info/type.ts

export type Editing = null | 'avatar' | 'phone' | 'password';

export type FormState = {
  templateUrl?: string | null;
  phone_number?: string;
  oldPassword?: string;
  newPassword?: string;
  confirm?: string;
  confirmPassword?: string;
  file?: File | null;
};

export type Errors = Partial<Record<keyof FormState, string>>;

export type DeviceItem = {
  deviceId: number | string;
  deviceName: string;
  serialNumber: string;
  isActive: boolean;
};

export type UserInfoDTO = {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  profileImg?: string | null;
  devices: DeviceItem[];
};

export type Point = { x: number; y: number };
export type Area = { width: number; height: number; x: number; y: number };

export type ShowPW = { old: boolean; new: boolean; confirm: boolean };

export type ToastKind = "success" | "error" | "info" | "danger";
export type ToastPayload = { type: ToastKind; text: string; id: number };

export type Template = { url: string; label: string; group: "profile" | "profile2" | string };