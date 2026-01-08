"use client";

import React from "react";
import { INFO_CARD_BG } from "@/components/ui/theme";
import SearchableSelect from "./SearchableSelect";
import type { Option } from "../types";
import SubmitButton from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";

export default function FormCard({
  form,
  errors,
  provinceOptions,
  cityOptions,
  districtOptions,
  subdistrictOptions,
  selectProvince,
  selectCity,
  selectDistrict,
  selectSubdistrict,
  handleChange,
  handleSubmit,
  loading,
}: {
  form: any;
  errors: Record<string, string>;
  provinceOptions: Option[];
  cityOptions: Option[];
  districtOptions: Option[];
  subdistrictOptions: Option[];
  selectProvince: (opt: Option | null) => void;
  selectCity: (opt: Option | null) => void;
  selectDistrict: (opt: Option | null) => void;
  selectSubdistrict: (opt: Option | null) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  loading: boolean;
}) {
  return (
    <section
      className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 backdrop-blur-md p-4 space-y-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-20"
      style={{ background: INFO_CARD_BG }}
      aria-label="Location and details form"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
          Location & Details
        </h3>
        <span className="text-[10px] text-white/50">
          Fields with <span className="text-red-300">*</span> are required
        </span>
      </div>

      {/* Street */}
      <FormInput
        label="Street *"
        name="street_name"
        value={form.street_name}
        onChange={handleChange}
        placeholder="Street name, house number"
        size="md"
        variant="dashboard"
        error={errors.street_name}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Province */}
        <div>
          <label className="text-[10px] text-white">
            Province <span className="text-red-300">*</span>
          </label>
          <SearchableSelect
            value={form.province_id}
            onChange={selectProvince}
            options={provinceOptions}
            placeholder="Select Province"
            disabled={provinceOptions.length === 0}
          />
          {errors.province_id && (
            <p className="text-[10px] text-red-300 mt-1">
              {errors.province_id}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="text-[10px] text-white">
            City/Regency <span className="text-red-300">*</span>
          </label>
          <SearchableSelect
            value={form.city_id}
            onChange={selectCity}
            options={cityOptions}
            placeholder="Select City"
            disabled={!form.province_id || cityOptions.length === 0}
          />
          {errors.city_id && (
            <p className="text-[10px] text-red-300 mt-1">
              {errors.city_id}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="text-[10px] text-white">
            District <span className="text-red-300">*</span>
          </label>
          <SearchableSelect
            value={form.district_id}
            onChange={selectDistrict}
            options={districtOptions}
            placeholder="Select District"
            disabled={!form.city_id || districtOptions.length === 0}
          />
          {errors.district_id && (
            <p className="text-[10px] text-red-300 mt-1">
              {errors.district_id}
            </p>
          )}
        </div>

        {/* Sub-district */}
        <div>
          <label className="text-[10px] text-white">
            Sub-district <span className="text-red-300">*</span>
          </label>
          <SearchableSelect
            value={form.subdistrict_id}
            onChange={selectSubdistrict}
            options={subdistrictOptions}
            placeholder="Select Sub-district"
            disabled={!form.district_id || subdistrictOptions.length === 0}
          />
          {errors.subdistrict_id && (
            <p className="text-[10px] text-red-300 mt-1">
              {errors.subdistrict_id}
            </p>
          )}
        </div>
      </div>

      {/* Postal Code (readonly) */}
      <FormInput
        label="Postal Code *"
        name="postal_code"
        value={form.postal_code}
        readOnly
        placeholder="Automatically filled input"
        size="md"
        variant="dashboard"
        error={errors.postal_code}
      />

      {/* Segment */}
      <FormInput
        label="Segment *"
        name="segmen"
        value={form.segmen}
        onChange={handleChange}
        placeholder="e.g., Residential / Home / School"
        size="md"
        variant="dashboard"
        error={errors.segmen}
      />

      {/* Detail Address */}
      <FormInput
        label="Detail Address *"
        name="detail_address"
        value={form.detail_address}
        onChange={handleChange}
        placeholder="e.g., 1st Floor / 2nd Floor"
        size="md"
        variant="dashboard"
        error={errors.detail_address}
      />

      <SubmitButton
        label="Submit Request"
        loading={loading}
        onClick={handleSubmit}
        size="md"
        radius="full"
      />
    </section>
  );
}
