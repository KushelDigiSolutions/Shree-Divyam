"use client";

import React from 'react';

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1720px] relative w-full md:h-[580px] h-auto bg-[#FFF6E8] overflow-hidden py-10 md:py-0">

      {/* Background Image Layer (Feather Watermark) */}
      <div
        className="hidden md:block absolute right-0 top-0 bottom-0 w-[522px] bg-contain bg-no-repeat bg-right-bottom z-0 opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
      />

      {/* Main Content */}
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-16 md:flex-row md:items-center md:justify-between relative z-10">

        {/* Left Side: Text and CTA */}
        <div className="w-full md:w-1/2 text-center md:text-left relative z-10">

          {/* Feather Watermark Behind Text */}
          <div
            className="absolute top-1/2 left-1/2 md:left-[40%] -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[450px] lg:w-[550px] h-[350px] md:h-[450px] lg:h-[550px] bg-contain bg-no-repeat bg-center z-[-1] opacity-25 pointer-events-none"
            style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
          />
          <h2 className="text-3xl md:text-[41px] font-playfair text-gray-800 leading-tight">
            Where Devotion Meets
          </h2>
          <h1 className="mt-4 text-2xl md:text-3xl lg:text-[41px] font-playfair font-bold text-gray-900">
            Royal Elegance
          </h1>

          <p className="mt-6 text-lg md:text-[20px] text-[#303030] font-poppins font-light max-w-xl mx-auto md:mx-0">
            Exquisite Dresses for Laddu Gopal,
            <span className="block">Radha Krishna & Mata Rani</span>
          </p>

          <button className="mt-8 rounded-sm bg-[#7A1F3D] px-10 py-3 text-base font-semibold text-white hover:bg-[#5E182F] transition-all shadow-lg active:scale-95">
            Shop Now
          </button>
        </div>

        {/* Right Side: Krishna-ji Image Container */}
        <div className="mt-10 w-full md:w-1/2 flex items-center justify-center relative">
          <div className="w-[300px] h-[300px] md:w-[564px] md:h-[564px] flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png"
              alt="Krishna-ji"
              className="relative md:mb-30 max-w-full h-auto object-contain"
            />
          </div>
        </div>

      </div>

      {/* Decorative Side Borders */}
      <div
        className="hidden lg:block absolute left-0 top-0 bottom-0 w-[40px] opacity-90 pointer-events-none bg-repeat-y bg-contain"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Group_10105_vzdpol.png")' }}
      />
      <div
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[40px] opacity-90 pointer-events-none bg-repeat-y bg-contain scale-x-[-1]"
        style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Group_10105_vzdpol.png")' }}
      />

    </section>
  );
}
