import Image from "next/image";

export function Still({
  src,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
}
