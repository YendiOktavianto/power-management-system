"use client";
import ProductText from "../ui/ProductText";
import ProductImage from "../ui/ProductImage";

type Props = { title: string; body: string; imageSrc: string };
export default function ProductsStableBox({ title, body, imageSrc }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 p-12 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 flex flex-col md:flex-row items-center md:items-start justify-center gap-10">
      <ProductText title={title} body={body} />
      <ProductImage src={imageSrc} />
    </div>
  );
}
