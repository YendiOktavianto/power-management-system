// getCroppedImg.ts – pastikan resize ke ukuran kecil + JPEG
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const size = 256; // ukuran avatar final
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // hitung scale sesuai crop
  const scaleX = image.naturalWidth / (image.width || 1);
  const scaleY = image.naturalHeight / (image.height || 1);

  // gambar area crop ke canvas 256x256
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    size,
    size
  );

  // pakai JPEG kualitas sedang biar kecil
  return canvas.toDataURL("image/jpeg", 0.7);
}
