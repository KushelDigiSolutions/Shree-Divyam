"use client";

import React from 'react';

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1720px] relative w-full md:h-[500px] lg:h-[580px] h-auto bg-[#FFF6E8] overflow-hidden py-8 md:py-0">

      {/* Background Image Layer (Feather Watermark) */}
      <div
        className="hidden md:block absolute right-0 top-0 bottom-0 w-[400px] lg:w-[522px] bg-contain bg-no-repeat bg-right-bottom z-0 opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
      />

      {/* Main Content */}
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-10 md:py-16 md:flex-row md:items-center md:justify-between relative z-10">

        {/* Left Side: Text and CTA */}
        <div className="w-full md:w-1/2 text-center md:text-left relative z-10">

          {/* Feather Watermark Behind Text */}
          <div
            className="absolute top-1/2 left-1/2 md:left-[40%] -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[350px] md:w-[380px] lg:w-[550px] h-[280px] sm:h-[350px] md:h-[380px] lg:h-[550px] bg-contain bg-no-repeat bg-center z-[-1] opacity-20 md:opacity-25 pointer-events-none"
            style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
          />
          <h2 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[41px] font-playfair text-gray-800 leading-tight">
            Where Devotion Meets
          </h2>
          <h1 className="mt-2 md:mt-4 text-3xl sm:text-4xl md:text-[32px] lg:text-[41px] font-playfair font-bold text-gray-900">
            Royal Elegance
          </h1>

          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-[18px] lg:text-[20px] text-[#303030] font-poppins font-light max-w-xl mx-auto md:mx-0">
            Exquisite Dresses for Laddu Gopal,
            <span className="block">Radha Krishna & Mata Rani</span>
          </p>

          <button className="mt-6 md:mt-8 rounded-sm bg-[#7A1F3D] border border-[#7A1F3D] px-8 md:px-10 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 shadow-lg active:scale-95 cursor-pointer">
            Shop Now
          </button>
        </div>

        {/* Right Side: Krishna-ji Image Container */}
        <div className="mt-10 md:mt-0 w-full md:w-1/2 flex items-center justify-center relative">
          <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[480px] md:h-[480px] lg:w-[564px] lg:h-[564px] flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png"
              alt="Krishna-ji"
              className="relative md:mb-10 lg:mb-30 max-w-full h-auto object-contain"
            />
          </div>
        </div>

      </div>

      {/* Decorative Side Borders */}
      <div
        className="hidden xl:block absolute left-0 top-0 bottom-0 w-[30px] lg:w-[40px] opacity-90 pointer-events-none bg-repeat-y bg-contain"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Group_10105_vzdpol.png")' }}
      />
      <div
        className="hidden xl:block absolute right-0 top-0 bottom-0 w-[30px] lg:w-[40px] opacity-90 pointer-events-none bg-repeat-y bg-contain scale-x-[-1]"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Group_10105_vzdpol.png")' }}
      />


    </section>
  );
}
