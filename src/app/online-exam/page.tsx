"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OnlineExamPlaceholder() {
  return (
    <main className="min-h-screen bg-[#F6F9EA] font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-28 pb-20 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 max-w-2xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">Onlayn İmtahan Sistemi</h1>
          <p className="text-gray-500 text-lg">Tezliklə...</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
