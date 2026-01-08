import { ADDRESS_NAME_MAX } from "./constants";
import type { DeviceRow, DataRow, ErrorMap } from "./types";

export const toDataRow = (r: DeviceRow): DataRow => ({
  id: r.id,
  serial_number: r.serial_number,
  username: r.username,
  wattage: r.wattage,
  phase: r.phase,
  address_name: r.address_name ?? "",
  detail_address_name: r.detail_address_name ?? "",
  long: r.long ?? Number.NaN,
  lat: r.lat ?? Number.NaN,
  segment: r.segment ?? "",
  active: r.active,
});

export const makeEmptyDevice = (): DataRow => ({
  id: "",
  serial_number: "",
  username: "",
  wattage: "",
  phase: "",
  address_name: "",
  detail_address_name: "",
  long: Number.NaN,
  lat: Number.NaN,
  segment: "",
  active: "YES",
});


export function validateEditDevice(row: DataRow): ErrorMap {
  const errors: ErrorMap = {};

  if (!row.address_name)
    errors.address_name = "Address name is required!";
  else if (row.address_name.length < 3)
    errors.address_name = "Address name must be at least 3 characters!";
  else if (row.address_name.length > ADDRESS_NAME_MAX)
    errors.address_name = "Address name cannot exceed 200 characters!";

  if (!row.detail_address_name)
    errors.detail_address_name = "Detail address is required!";
  else if (row.detail_address_name.length < 3)
    errors.detail_address_name =
      "Detail address must be at least 3 characters!";
  else if (row.detail_address_name.length > 50)
    errors.detail_address_name =
      "Detail address cannot exceed 50 characters!";

  if (Number.isNaN(row.lat))
    errors.lat = "Latitude is required!";
  else if (row.lat < -90 || row.lat > 90)
    errors.lat = "Latitude must be between -90 and 90!";

  if (Number.isNaN(row.long))
    errors.long = "Longitude is required!";
  else if (row.long < -180 || row.long > 180)
    errors.long = "Longitude must be between -180 and 180!";

  if (!row.segment)
    errors.segment = "Segment is required!";
  else if (row.segment.length < 3)
    errors.segment = "Segment must be at least 3 characters!";
  else if (row.segment.length > 30)
    errors.segment = "Segment cannot exceed 30 characters!";
  else if (!/^[A-Za-z\s]+$/.test(row.segment))
    errors.segment = "Segment can only contain letters and spaces.";

  return errors;
}

export function validateNewDevice(row: DataRow): ErrorMap {
  const errors: ErrorMap = {};

  if (!row.serial_number)
    errors.serial_number = "Serial number is required!";
  else if (row.serial_number.length < 5)
    errors.serial_number =
      "Serial number must be at least 5 characters long!";
  else if (row.serial_number.length > 30)
    errors.serial_number = "Serial number cannot exceed 30 characters!";

  if (!row.username)
    errors.username = "Owner (Username) is required!";
  else if (row.username.length < 8) {
    errors.username = "username must be at least 8 characters";
  } else if (row.username.length > 30) {
    errors.username = "username must be at most 30 characters";
  } else if (/\s/.test(row.username)) {
    errors.username = "username cannot contain spaces";
  } else if (!/^[A-Z]/.test(row.username)) {
    errors.username = "username must start with an uppercase letter";
  } else if (!/^[A-Z][A-Za-z0-9_.\-@!#$%^&*]+$/.test(row.username)) {
    errors.username =
      "username can only contain letters, numbers, and special characters . _ - @ ! # $ % ^ & *";
  }

  if (!row.address_name)
    errors.address_name = "Address name is required!";
  else if (row.address_name.length < 3)
    errors.address_name = "Address name must be at least 3 characters!";
  else if (row.address_name.length > ADDRESS_NAME_MAX)
    errors.address_name = "Address name cannot exceed 200 characters!";

  if (!row.detail_address_name)
    errors.detail_address_name = "Detail address is required!";
  else if (row.detail_address_name.length < 3)
    errors.detail_address_name =
      "Detail address must be at least 3 characters!";
  else if (row.detail_address_name.length > 50)
    errors.detail_address_name =
      "Detail address cannot exceed 50 characters!";

  if (Number.isNaN(row.lat))
    errors.lat = "Latitude is required!";
  else if (row.lat < -90 || row.lat > 90)
    errors.lat = "Latitude must be between -90 and 90!";

  if (Number.isNaN(row.long))
    errors.long = "Longitude is required!";
  else if (row.long < -180 || row.long > 180)
    errors.long = "Longitude must be between -180 and 180!";

  if (!row.segment)
    errors.segment = "Segment is required!";
  else if (row.segment.length < 3)
    errors.segment = "Segment must be at least 3 characters!";
  else if (row.segment.length > 30)
    errors.segment = "Segment cannot exceed 30 characters!";
  else if (!/^[A-Za-z\s]+$/.test(row.segment))
    errors.segment = "Segment can only contain letters and spaces.";

  return errors;
}
