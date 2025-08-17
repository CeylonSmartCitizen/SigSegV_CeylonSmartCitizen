


"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image
        src="/logo.png"
        alt="Ceylon Smart Citizen AI Logo"
        width={140}
        height={140}
        priority
        style={{ marginBottom: 40 }}
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center tracking-tight">Welcome to Ceylon Smart Citizen</h1>
      <button
        className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition"
        onClick={() => router.push("/auth/login")}
      >
        Get Started
      </button>
    </div>
  );
}
