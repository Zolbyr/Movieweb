import Image from "next/image";
import { cinemaProviders, type ProviderId } from "../../../lib/cinemas";

export function CinemaLogo({ provider }: { provider: ProviderId }) {
  const brand = cinemaProviders.find((item) => item.id === provider)!;
  return <span className={"cinema-logo cinema-logo-" + provider} aria-hidden="true">
    <Image src={brand.logo} alt="" width={64} height={28} unoptimized />
  </span>;
}

export function CinemaBrand({ provider }: { provider: ProviderId }) {
  const brand = cinemaProviders.find((item) => item.id === provider)!;
  return <span className="cinema-brand"><CinemaLogo provider={provider} /><span>{brand.name}</span></span>;
}
