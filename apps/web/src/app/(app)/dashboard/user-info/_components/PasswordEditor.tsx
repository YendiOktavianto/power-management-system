"use client";

import FormInput from "@/components/ui/FormInput";

export default function PasswordEditor({
  form,
  setForm,
  errors,
  showPW,
  setShowPW,
}: {
  form: any;
  setForm: (v: any) => void;
  errors: Record<string, string>;
  showPW: { old: boolean; new: boolean; confirm: boolean };
  setShowPW: (
    updater: (s: { old: boolean; new: boolean; confirm: boolean }) => {
      old: boolean;
      new: boolean;
      confirm: boolean;
    }
  ) => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <FormInput
        label="Old Password"
        name="oldPassword"
        type="password"
        placeholder="Old Password"
        value={form.oldPassword}
        onChange={(e) =>
          setForm({ ...form, oldPassword: e.target.value })
        }
        size="md"
        variant="dashboard"
        passwordToggle
        showPassword={showPW.old}
        onTogglePassword={() =>
          setShowPW((s) => ({ ...s, old: !s.old }))
        }
        autoComplete="current-password"
        error={errors.oldPassword}
      />

      <FormInput
        label="New Password"
        name="newPassword"
        type="password"
        placeholder="New Password"
        value={form.newPassword}
        onChange={(e) =>
          setForm({ ...form, newPassword: e.target.value })
        }
        size="md"
        variant="dashboard"
        passwordToggle
        showPassword={showPW.new}
        onTogglePassword={() =>
          setShowPW((s) => ({ ...s, new: !s.new }))
        }
        autoComplete="new-password"
        error={errors.newPassword}
      />

      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={(e) =>
          setForm({ ...form, confirmPassword: e.target.value })
        }
        size="md"
        variant="dashboard"
        passwordToggle
        showPassword={showPW.confirm}
        onTogglePassword={() =>
          setShowPW((s) => ({ ...s, confirm: !s.confirm }))
        }
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
    </div>
  );
}
