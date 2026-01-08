"use client";
export default function ProductImage({ src }: { src: string }) {
  return (
    <div className="flex-1 flex justify-center md:justify-end">
      <img
        src={src || "/monitoring.png"}
        alt="Stable Performance Illustration"
        className="w-full h-full object-cover rounded-t-2xl md:rounded-bl-none md:rounded-tr-2xl mb-[-100rem]"
        style={{ marginBottom: 0 }}   // mirror perilaku asli
      />
    </div>
  );
}
