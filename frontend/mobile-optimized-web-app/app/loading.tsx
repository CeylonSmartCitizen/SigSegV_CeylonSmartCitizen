import Image from "next/image";
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image
        src="/logo.png"
        alt="Ceylon Smart Citizen AI Logo"
        width={120}
        height={120}
        priority
        style={{ marginBottom: 32 }}
      />
      <div className="text-lg font-semibold text-gray-700 mt-2 animate-pulse">Loading...</div>
    </div>
  );
}
