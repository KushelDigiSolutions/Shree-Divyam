"use client";

import { Play } from "lucide-react";

export default function DivinitySection() {
  return (
    <section className="mx-auto max-w-[1720px] bg-[#7A1F3D] py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="text-[#ffffff]">

            <h2 className="text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-playfair font-medium leading-[1.2] mb-6">
              Celebrate Divinity with <br />
              Beautiful Poshak
            </h2>

            <p className="text-[14px] sm:text-[15px] md:text-[19px]  font-right font-gt-walsheim leading-[1.8] text-[#ffffff] max-w-[520px] mb-8">
              Discover a divine collection of Laddu Gopal, Radha Krishna, and Mata Rani dresses, crafted with love and devotion. Each poshak is designed to bring elegance, tradition, and spiritual beauty to your temple, making every occasion more special and sacred.
            </p>

            <button className="border border-[#FFCF5D] text-white px-10 py-3 text-[16px] font-gt-walsheim font-medium hover:bg-white/10 transition">
              Know More
            </button>

          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">

            <div className="rounded-[28px] overflow-hidden">
              <img
                src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774937581/Celebrate%20Divinity%20with%20Beautiful%20Poshak.png"
                alt="Divinity"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay */}


            {/* PLAY BUTTON */}
            <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#7A1F3D] shadow-lg hover:scale-105 transition">
              <Play size={22} className="ml-1 text-white" />
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}