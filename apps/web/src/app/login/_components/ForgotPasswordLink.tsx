"use client";

type Props = {
  label?: string;
  onClick?: () => void;
};

export default function ForgotPasswordLink({ label = "forgot password?",onClick }: Props) {
  return (
    <button
      type="button" 
      onClick={onClick}
      className="text-xs text-blue-400 hover:underline"
    >
      {label}
    </button>
  );
}
