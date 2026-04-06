"use client";

import React from 'react';

export default function PromoSection() {
  return (
    <section className="mx-auto max-w-[1720px] relative w-full md:h-[742px] h-auto flex flex-col md:flex-row overflow-hidden">

      {/* Left Column: Maroon Background with Text */}
      <div className="w-full md:w-1/2 min-h-[500px] bg-[#7A1F3D] flex items-center relative py-12 md:py-16">
        <div
          className="absolute inset-0 bg-no-repeat bg-bottom-right opacity-80 pointer-events-none"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")',
            backgroundSize: '80%'
          }}
        />

        <div className="w-full max-w-[720px] mx-auto md:ml-auto md:mr-0 px-4 sm:px-8 md:px-16 lg:px-24 relative z-10 text-white space-y-4 text-center md:text-left">
          <h2 className="text-3xl md:text-[41px] font-playfair">
            Where Devotion Meets
          </h2>
          <h2 className="text-4xl md:text-5xl font-playfair  font-bold">
            Royal Elegance
          </h2>
          <p className="text-lg md:text-[20px] opacity-80 font-gt-walsheim font-right pt-4">
            Exquisite Dresses for Laddu Gopal,<br />
            Radha Krishna & Mata Rani
          </p>
        </div>
      </div>

      {/* Right Column: Image of Dress */}
      <div className="w-full md:w-1/2 min-h-[500px] bg-gray-100 flex items-center justify-start overflow-hidden">
        <div className="w-full max-w-[720px] mx-auto md:mr-auto md:ml-0 h-full flex items-center justify-center relative group overflow-hidden">
          <div className="relative w-full h-full min-h-[400px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856521/blue-dress-placeholder.png")' }}>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png' alt="Krishna-ji" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20 md:left-auto md:right-8 md:-translate-x-0">
          <div className="w-2.5 h-2.5 rounded-full border border-white cursor-pointer hover:bg-white/50 transition-colors"></div>
          <div className="w-3 h-3 rounded-full bg-white shadow-lg cursor-pointer"></div>
          <div className="w-2.5 h-2.5 rounded-full border border-white cursor-pointer hover:bg-white/50 transition-colors"></div>
        </div>
      </div>

    </section>
  );
}

