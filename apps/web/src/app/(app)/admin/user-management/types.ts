/* ---------- Types ---------- */
export type DataRow = {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
  role: string;
  total_device: number;
  created_at: string;
};

export type NewUserPayload = Omit<DataRow, "id" | "created_at">;

export type EditDraft = Omit<
  DataRow,
  "id" | "created_at" | "password" | "confirmPassword"
>;

export type HeaderBarProps = {
  onExport: () => void;
  onAdd?: () => void; 
};