"use client";

export default function GiftSection() {
  return (
    <section className="mx-auto max-w-[1720px] relative overflow-hidden w-full min-h-[410px] h-auto bg-[#F7F0E5] py-8 sm:py-10 lg:py-0 flex items-center">
      {/* Top Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-[30px] sm:h-[50px] z-10 pointer-events-none overflow-hidden">
        <div
          className="w-full h-full bg-repeat-x bg-contain opacity-80"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute bottom-0 left-0 w-full h-[30px] sm:h-[50px] z-10 pointer-events-none overflow-hidden">
        <div
          className="w-full h-full bg-repeat-x bg-contain opacity-80 rotate-180"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      <div className="relative w-full py-4 lg:py-0">
        <div className="flex flex-col lg:grid lg:items-center gap-6 md:gap-10 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">

          <div className="order-2 lg:order-1 flex justify-center lg:justify-start group">
            <div className="relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952010/Life%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our%20Gift%20to%20God..png"
                alt="Decorative floral poshak set"
                className="h-[150px] sm:h-[220px] lg:h-[282px] w-auto max-w-full object-contain lg:object-left lg:mt-12 transition-transform duration-500 group-hover:scale-105"
              />
              {/* Full-coverage hover overlay */}
              <div className="absolute inset-0 bg-[#7A1F3D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
            </div>
          </div>


          <div className="order-1 text-center lg:order-2 px-6 lg:px-0">
            <div className="mx-auto max-w-[760px]">
              <h2 className="font-gt-walsheim text-[20px] sm:text-[32px] md:text-[42px] lg:text-[40px] lg:mt-4 font-medium leading-[1.3] text-[#3F3F50] text-center mx-auto">
                “Life is God’s gift to us. What<br className="hidden lg:block" />
                we do with our work is our<br className="hidden lg:block" />
                <span className="text-[#7A1F3D] font-semibold">Gift to God.”</span>
              </h2>

             
            </div>
          </div>


          <div className="order-3 flex justify-center lg:justify-end group">
            <div className="relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952018/Life%20is%20God%E2%80%99s%20gift%20to%20us.png"
                alt="Decorative floral poshak set"
                className="h-[150px] sm:h-[220px] lg:h-[282px] w-auto max-w-full object-contain lg:object-right lg:mt-12 transition-transform duration-500 group-hover:scale-105"
              />
              {/* Full-coverage hover overlay */}
              <div className="absolute inset-0 bg-[#7A1F3D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


