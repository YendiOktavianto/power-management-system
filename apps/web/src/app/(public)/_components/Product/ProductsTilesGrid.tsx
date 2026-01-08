"use client";
import ProductTile from "./ProductTile";

type Tile = { value?: string; text: string };
export default function ProductsTilesGrid({ tiles = [] as Tile[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-10">
      {tiles[0] && <ProductTile variant={1} value={tiles[0].value} text={tiles[0].text} />}
      {tiles[1] && <ProductTile variant={2} text={tiles[1].text} />}
    </div>
  );
}
