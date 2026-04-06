"use client";

import { Sparkles, Scissors, Leaf } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Sparkles,
    title: "Purity of Materials",
    description:
      "We source only the finest Banarasi silks, hand-woven gold Zari, and organic cottons to ensure sanctity in every garment.",
  },
  {
    id: 2,
    icon: Scissors,
    title: "Artisanal Mastery",
    description:
      "Each piece is crafted by hereditary artisans who understand the spiritual significance of the iconography they weave.",
  },
  {
    id: 3,
    icon: Leaf,
    title: "Eco-Spiritual Conscious",
    description:
      "Natural dyes and sustainable processes are used to honor the Earth as we honor the Divine.",
  },
];

export default function SacredCraft() {
  return (
    <section className="mx-auto max-w-[1720px] bg-[#FFFFFF] w-full lg:h-[674px] h-auto py-12 sm:py-14 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-[520px_minmax(0,1fr)] lg:gap-14">
          {/* Left Image */}
          <div className="relative mx-auto w-full max-w-[546px]">
            <div className="overflow-hidden rounded-[20px] sm:rounded-[22px]">
              <img
                src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774942493/Our%20Sacred%20Craft%20A%20Legacy%20of%20Devotion.png"
                alt="Artisan crafting dress"
                className="w-full h-full aspect-square object-cover"
              />
            </div>

            <div className="absolute bottom-[-12px] right-3 sm:bottom-[-14px] sm:right-4 md:right-5 lg:bottom-[-12px] lg:right-[-14px]">
              <div className="flex h-[88px] w-[112px] flex-col items-center justify-center rounded-[16px] bg-[#7A1F3D] text-white shadow-lg sm:h-[94px] sm:w-[122px] sm:rounded-[18px] md:h-[150px] md:w-[208px]">
                <span className="font-serif text-[48px] font-bold  font-playfair leading-none sm:text-[26px] md:text-[40px]">
                  100%
                </span>
                <span className="mt-2 text-[14px] font-semibold font-gt-walsheim uppercase tracking-[0.18em] text-white/95 sm:text-[9px]">
                  Handcrafted
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="mx-auto w-full max-w-[481px] mt-8 lg:mt-0 ml-0 lg:ml-12 lg:max-w-none">
            <div className="mb-6 sm:mb-7 md:mb-8">
              <h2 className="font-serif text-[36px]  font-bold leading-[1.1] text-[#1F2230] sm:text-[34px] md:text-[38px] lg:text-[40px]">
                Our Sacred Craft
              </h2>
              <p className="mt-1 font-serif text-[36px] font-playfair font-bold leading-[1.1] text-[#7A1F3D] sm:text-[34px] md:text-[38px] lg:text-[40px]">
                A Legacy of Devotion
              </p>
            </div>

            <div className="space-y-5 sm:space-y-6 ">
              {features.map((feature) => {
               
                const Icon = feature.icon;

                return (
                  <div key={feature.id} className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full border border-[#7A1F3D] text-[#7A1F3D] sm:h-[32px] sm:w-[32px]">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>

                    <div className="max-w-[500px]">
                      <h3 className="text-[18px] font-medium leading-[1.3] font-gt-walsheim text-[#303030] sm:text-[15px]">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-[16px] leading-[1.6] font-gt-walsheim font-right text-[#303030] sm:text-[12px] md:text-[16px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}