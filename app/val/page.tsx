import Image from "next/image";

export default function ValoPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/backgrounds/valorant-bg.jpg')" }}
    >
      <Image
        src="/logos/valorant-logo.png"
        alt="Valorant"
        width={300}
        height={150}
        className="mt-8 h-auto w-64"
        priority
      />
    </div>
  );
}
