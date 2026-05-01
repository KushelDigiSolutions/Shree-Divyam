"use client";

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export default function PromoSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const slides = [
    {
      id: 1,
      image: 'https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png',
      alt: 'Laddu Gopal Dress'
    },
    {
      id: 2,
      image: 'https://shree-divyam.s3.ap-south-1.amazonaws.com/products/1775645957-Marble-Goddess-Durga-With-Dress-MSTD235.jpg',
      alt: 'Mata Rani Dress'
    },
    {
      id: 3,
      image: 'https://shree-divyam.s3.ap-south-1.amazonaws.com/products/1775645568-rk_set_heavy_border.jpg',
      alt: 'Radha Krishna Dress'
    }
  ];

  return (
    <section className="mx-auto max-w-[1720px] relative w-full h-auto flex flex-col md:flex-row overflow-hidden">

      {/* Left Column: Maroon Background with Text */}
      <div className="w-full md:w-1/2 min-h-[350px] sm:min-h-[450px] md:min-h-[600px] lg:min-h-[742px] bg-[#7A1F3D] flex items-center relative py-12 md:py-16 overflow-hidden">
        <img
          src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777272312/Where%20Devotion%20Meets.png"
          alt="feather"
          className="absolute bottom-0 right-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] lg:w-[300px] lg:h-[300px] opacity-50 md:opacity-60 pointer-events-none"
        />

        <div className="w-full max-w-[720px] mx-auto md:ml-auto md:mr-0 px-6 sm:px-10 md:px-16 lg:px-24 relative z-10 text-white space-y-3 sm:space-y-4 text-center md:text-left">
          <h2 className="text-[18px] sm:text-[32px] md:text-[38px] lg:text-[41px] font-playfair leading-tight">
            Where Devotion Meets
          </h2>
          <h2 className="text-[24px] sm:text-[44px] md:text-[48px] lg:text-[54px] font-playfair font-bold leading-tight">
            Royal Elegance
          </h2>
          <p className="text-[14px] sm:text-[17px] md:text-[19px] lg:text-[20px] opacity-90 font-gt-walsheim pt-3 sm:pt-4 max-w-[450px] mx-auto md:mx-0">
            Exquisite Dresses for Laddu Gopal,<br className="hidden sm:block" />
            Radha Krishna & Mata Rani
          </p>
        </div>
      </div>

      {/* Right Column: Image Slider */}
      <div className="w-full md:w-1/2 min-h-[350px] sm:min-h-[450px] md:min-h-[600px] lg:min-h-[742px] bg-gray-100 overflow-hidden relative promo-swiper-container">
        {isMounted ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            loop={true}
            className="w-full h-full"
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="w-full h-full flex items-center justify-center relative group overflow-hidden bg-gray-200/50">
                  <img 
                    src={slide.image} 
                    alt={slide.alt} 
                    className="w-full h-full object-cover md:object-contain lg:object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Full-coverage hover overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200/50">
            <img 
              src={slides[0].image} 
              alt={slides[0].alt} 
              className="w-full h-full object-cover md:object-contain lg:object-cover" 
            />
          </div>
        )}
      </div>
    </section>
  );
}

