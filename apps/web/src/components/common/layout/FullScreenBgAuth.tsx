"use client";

type Props = {
  bgSrc?: string;
  className?: string;
  children: React.ReactNode;
};

export default function FullScreenBg({ bgSrc = "/bg1.png", className = "", children }: Props) {
  return (
    <div
      className={
        "h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden " +
        className
      }
      style={{ backgroundImage: `url('${bgSrc}')` }}
    >
      {children}
    </div>
  );
}
