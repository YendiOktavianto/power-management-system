export type Status = "pending" | "approved" | "rejected";

export type Request = {
  id: number;
  username: string; // <- pakai string kecil, bukan String
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: Status; // "pending" | "approved" | "rejected"
};

export type RequestAction = Extract<Status, "approved" | "rejected">;

export type HandleAction = (
  id: number,
  status: RequestAction,
  device_id?: string
) => Promise<void>;