"use client";

import PhoneInput from "react-phone-input-2";
import FormInput from "@/components/ui/FormInput";

export default function PhoneEditor({
  form,
  setForm,
  errors,
}: {
  form: any;
  setForm: (v: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <FormInput
      label="Phone Number"
      error={errors.phone_number}
      size="md"
      variant="dashboard"         
      containerClassName="text-sm"
      asChild               
    >
      <PhoneInput
        country={"id"}
        onlyCountries={["id"]}
        disableDropdown
        value={form.phone_number}
        onChange={(phone) => {
          const formatted = phone.startsWith("+62")
            ? phone
            : "+62" + phone.replace(/^(\+|0|62)+/, "");
          setForm({ ...form, phone_number: formatted });
        }}
        onKeyDown={(e) => {
          const input = e.currentTarget as HTMLInputElement;
          if (
            (input.selectionStart ?? 0) <= 3 &&
            (e.key === "Backspace" || e.key === "Delete")
          )
            e.preventDefault();
        }}
        containerClass="!w-full !text-sm"
        inputClass="
          !bg-transparent !border-none !outline-none
          !w-full !placeholder-white/50
          !h-4 !pl-11 !text-sm !text-white
        "
        buttonClass="!bg-transparent !border-none !h-5 !ml-[-3px] !outline-none"
        dropdownClass="!bg-[#0C1F3C] !text-white !rounded-sm"
        placeholder="Phone Number"
      />
    </FormInput>
  );
}
