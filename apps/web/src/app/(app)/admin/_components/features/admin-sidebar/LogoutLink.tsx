"use client";

type Props = {
  active: boolean;
  onClick: () => void;
};

export default function LogoutLink({ active, onClick }: Props) {
  return (
    <a
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          (e.currentTarget as HTMLAnchorElement).click();
        }
      }}
      role="button"
      tabIndex={0}
      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#1A1F37] transition-colors duration-200 ${
        active ? "bg-[#1A1F37] text-white font-medium" : "text-gray-300 hover:text-white"
      }`}
    >
      <img
        src={active ? "/exit_active.svg" : "/exit.svg"}
        alt="Logout"
        className="w-4 h-4"
      />
      <span>Logout</span>
    </a>
  );
}
