"use client";

import PhoneInput from "react-phone-input-2";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/FormInput";

export default function AddUserModal({
  open,
  onClose,
  apiError,
  formErrors,
  newUser,
  setNewUser,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  apiError?: string;
  formErrors: Record<string, string | undefined>;
  newUser: any;
  setNewUser: (v: any) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="space-y-3 text-sm">
        <h3 className="text-lg font-bold mb-4 text-center">Add New User</h3>

        {apiError && <p className="text-red-300 text-xs mb-2">{apiError}</p>}

        <div className="flex flex-col gap-3 text-sm">

            <Input
              type="text"
              label="Username"
              placeholder="Username"
              size="md"
              variant="dashboard"
              containerClassName="text-sm"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              error={formErrors.username}
            />
            

            <Input
              type="email"
              label="Email"
              placeholder="Email"
              value={newUser.email}
              size="md"
              variant="dashboard"   
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              error={formErrors.email}
            />   

          <Input
            label="Number Phone"
            size="md"
            variant="dashboard"         
            containerClassName="text-sm"
            asChild               
            error={formErrors.phone_number}
          >
            <PhoneInput
              country={"id"}
              value={newUser.phone_number}
              onChange={(phone) => {
                const formatted = phone.startsWith("+62") ? phone : "+62" + phone.replace(/^(\+|0|62)+/, "");
                setNewUser({ ...newUser, phone_number: formatted });
              }}
              onKeyDown={(e) => {
                const input = e.currentTarget as HTMLInputElement;
                if ((input.selectionStart ?? 0) <= 3 && (e.key === "Backspace" || e.key === "Delete")) e.preventDefault();
              }}
              disableDropdown
              
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

          <Input
            label="Password"
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            size="md"
            variant="dashboard"
            passwordToggle
            autoComplete="new-password"
            error={formErrors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            size="md"
            variant="dashboard"
            containerClassName="text-sm"
            value={newUser.confirmPassword}
            passwordToggle
            autoComplete="new-password"
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
            error={formErrors.confirmPassword}
          />

       <Input
          label="Role"
          size="md"
          variant="dashboard"
          asChild
        >
          <select
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value })
            }
            className="
              w-full bg-transparent outline-none text-sm
              text-white
            "
          >
            <option value="user" className="bg-[#103879] text-white">
              User
            </option>
            <option
              value="admin"

              className="bg-[#103879] text-white"
            >
              Admin
            </option>
          </select>
        </Input>
        </div>

        <div className="flex justify-end gap-2 mt-10 ml-50">
          <Button label="Cancel" onClick={onClose} disabled={submitting} variant="secondary" radius="xl" size="md">           
          </Button>
          <Button label={submitting ? "Saving..." : "Add"} onClick={onSubmit} disabled={submitting || !newUser.username || !newUser.email || !newUser.phone_number} variant="primary" radius="xl" size="md"
          >
          </Button>
        </div>
    </div>
  );
}
