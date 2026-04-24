"use client";

import { Play } from "lucide-react";

export default function DivinitySection() {
  return (
    <section className="mx-auto max-w-[1720px] bg-[#7A1F3D] py-10 sm:py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="text-[#ffffff] flex flex-col items-center lg:items-start text-center lg:text-left">

            <h2 className="text-[18px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-playfair font-medium leading-[1.2] mb-4 sm:mb-6">
              Celebrate Divinity with <br className="hidden sm:block" />
              Beautiful Poshak
            </h2>

            <p className="text-[14px] sm:text-[15px] md:text-[18px] lg:text-[19px] font-gt-walsheim leading-relaxed text-[#ffffff] max-w-[520px] mb-6 sm:mb-8 font-light opacity-90">
              Discover a divine collection of Laddu Gopal, Radha Krishna, and Mata Rani dresses, crafted with love and devotion. Each poshak is designed to bring elegance, tradition, and spiritual beauty to your temple, making every occasion more special and sacred.
            </p>

            <button className="border border-white text-white px-8 md:px-10 py-2 sm:py-2.5 md:py-3 text-[14px] sm:text-[15px] md:text-[16px] font-gt-walsheim font-medium hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 w-fit active:scale-95 cursor-pointer">
              Know More
            </button>

          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full max-w-[500px] sm:max-w-[600px] mx-auto lg:max-w-none lg:mx-0">

            <div className="rounded-[16px] sm:rounded-[28px] overflow-hidden shadow-2xl">
              <img
                src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774937581/Celebrate%20Divinity%20with%20Beautiful%20Poshak.png"
                alt="Divinity"
                className="w-full h-full object-cover aspect-[4/3] sm:aspect-auto"
              />
            </div>

            {/* PLAY BUTTON */}
            <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-[#7A1F3D] shadow-lg hover:scale-105 transition cursor-pointer">
              <Play size={18} fill="white" className="ml-1 text-white sm:w-[20px] md:w-[22px]" />
            </button>

          </div>

        </div>
      </div>
    </section>

  );
}