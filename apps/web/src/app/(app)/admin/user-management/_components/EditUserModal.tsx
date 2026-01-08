"use client";

import PhoneInput from "react-phone-input-2";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/FormInput";

export default function EditUserModal({
  open,
  apiError,
  editRow,
  editDraft,
  setEditDraft,
  onCancel,
  submitting,
  onSave,
}: {
  open: boolean;
  apiError?: string;
  editRow: any;
  editDraft: any;
  setEditDraft: (v: any) => void;
  onCancel: () => void;
  submitting: boolean;
  onSave: () => void;
}) {
  if (!(open && editRow && editDraft)) return null;

  return (
    <div>
        <h3 className="text-lg font-bold mb-4 text-center">Edit User</h3>

        {apiError && <p className="text-red-300 text-xs mb-2">{apiError}</p>}

        <div className="flex flex-col gap-3 text-sm">
          <div>
            <Input
              label="Username"
              type="text"
              variant="dashboard"
              size="md"
              value={editDraft.username}
              onChange={(e) => setEditDraft({ ...editDraft, username: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              variant="dashboard"
              size="md"
              value={editDraft.email}
              onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
            />
          </div>
          <Input
            label="Number Phone"
            size="md"
            variant="dashboard"         
            containerClassName="text-sm"
            asChild               
          >
            <PhoneInput
              country={"id"}
                value={editDraft.phone_number}
                onChange={(phone) => {
                  const formatted = phone.startsWith("+62") ? phone : "+62" + phone.replace(/^(\+|0|62)+/, "");
                  setEditDraft({ ...editDraft, phone_number: formatted });
                }}
                onKeyDown={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  if ((input.selectionStart ?? 0) <= 3 && (e.key === "Backspace" || e.key === "Delete")) e.preventDefault();
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
          </Input>

        </div>
        

        <div className="flex justify-end gap-2 mt-10 ml-50">
          <Button onClick={onCancel} disabled={submitting} variant="secondary" size="md" radius="xl">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={submitting} variant="primary" size="md" radius="xl">
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
    </div>
  );
}
