// app/(app)/dashboard/user-info/add-device/validation.ts

export type AddDeviceForm = {
  street_name: string;
  province_id: string;
  city_id: string;
  district_id: string;
  subdistrict_id: string;
  postal_code: string | number;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
};

export function validateAddDevice(form: AddDeviceForm) {
  const errors: Record<string, string> = {};
  if (!form.street_name) errors.street_name = "street name is required";
  if (!form.province_id) errors.province_id = "province is required";
  if (!form.city_id) errors.city_id = "city/regency is required";
  if (!form.district_id) errors.district_id = "district is required";
  if (!form.subdistrict_id) errors.subdistrict_id = "sub-district is required";
  if (!form.postal_code) errors.postal_code = "postal code is required";
  if (!form.segmen) errors.segmen = "segment is required";
  if (!form.detail_address) errors.detail_address = "detail address is required";
  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
