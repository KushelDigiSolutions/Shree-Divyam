"use client";

import React from 'react';

export default function PromoSection() {
  return (
    <section className="mx-auto max-w-[1720px] relative w-full h-auto flex flex-col md:flex-row overflow-hidden">

      {/* Left Column: Maroon Background with Text */}
      <div className="w-full md:w-1/2 min-h-[350px] sm:min-h-[450px] md:min-h-[600px] lg:min-h-[742px] bg-[#7A1F3D] flex items-center relative py-12 md:py-16">
        <div
          className="absolute inset-0 bg-no-repeat bg-bottom-right opacity-60 md:opacity-80 pointer-events-none"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")',
            backgroundSize: '80%'
          }}
        />

        <div className="w-full max-w-[720px] mx-auto md:ml-auto md:mr-0 px-6 sm:px-10 md:px-16 lg:px-24 relative z-10 text-white space-y-3 sm:space-y-4 text-center md:text-left">
          <h2 className="text-[20px] sm:text-[32px] md:text-[38px] lg:text-[41px] font-playfair leading-tight">
            Where Devotion Meets
          </h2>
          <h2 className="text-[28px] sm:text-[44px] md:text-[48px] lg:text-[54px] font-playfair font-bold leading-tight">
            Royal Elegance
          </h2>
          <p className="text-[14px] sm:text-[17px] md:text-[19px] lg:text-[20px] opacity-90 font-gt-walsheim pt-3 sm:pt-4 max-w-[450px] mx-auto md:mx-0">
            Exquisite Dresses for Laddu Gopal,<br className="hidden sm:block" />
            Radha Krishna & Mata Rani
          </p>
        </div>
      </div>

      {/* Right Column: Image of Dress */}
      <div className="w-full md:w-1/2 min-h-[350px] sm:min-h-[450px] md:min-h-[600px] lg:min-h-[742px] bg-gray-100 flex items-center justify-start overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center relative group overflow-hidden">
          <div className="relative w-full h-full min-h-[350px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png' alt="Krishna-ji" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20 md:left-auto md:right-8 md:-translate-x-0">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-white cursor-pointer hover:bg-white/50 transition-colors"></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-lg cursor-pointer"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-white cursor-pointer hover:bg-white/50 transition-colors"></div>
        </div>
      </div>


    </section>
  );
}

