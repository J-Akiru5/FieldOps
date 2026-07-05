import Image from "next/image";

interface ServiceCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

export function ServiceCard({ imageSrc, imageAlt, title, description }: ServiceCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 overflow-hidden">
        <Image src={imageSrc} alt={imageAlt} width={48} height={48} className="object-contain" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
