"use client";

import React from 'react';

const collections = [
  {

    image: "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867814/laddu-Gopal.png",
  },
  {

    image: "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/radha-krishna.png",
  },
  {

    image: "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/mata-rani.png",
  }
];

export default function Collections() {
  return (
    <section className="mx-auto max-w-[1720px] py-20 bg-[#FFF6E8] w-full md:h-[716px] h-auto overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-[40px] font-playfair text-[#7A1F3D] font-bold">
            Premium Collections
          </h2>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:justify-center">
          {collections.map((item, index) => (
            <div
              key={index}
              className=" w-full md:w-[380px] h-[500px] overflow-hidden  cursor-pointer  shrink-0"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
