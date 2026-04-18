"use client";

export default function GiftSection() {
  return (
    <section className="mx-auto max-w-[1720px] relative overflow-hidden w-full h-[410px] bg-[#F7F0E5] py-14 lg:py-0 flex items-center">
      {/* Top Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-[40px] sm:h-[50px] z-10 pointer-events-none overflow-hidden">
        <div
          className="w-full h-full bg-repeat-x bg-contain opacity-80"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute bottom-0 left-0 w-full h-[40px] sm:h-[50px] z-10 pointer-events-none overflow-hidden">
        <div
          className="w-full h-full bg-repeat-x bg-contain opacity-80 rotate-180"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      <div className="relative w-full">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">

          <div className="order-2 flex justify-center lg:order-1 lg:justify-start lg:ml-0">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952010/Life%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our%20Gift%20to%20God..png"
              alt="Decorative floral poshak set"
              className="h-[282px] w-[400px] max-w-full object-contain object-left lg:mt-12"
            />
          </div>


          <div className="order-1 text-center lg:order-2 px-6 lg:px-0">
            <div className="mx-auto max-w-[760px]">
              <h2 className="font-gt-walsheim text-[22px] sm:text-[34px] md:text-[42px] lg:text-[40px] lg:mt-20 font-medium leading-[1.3] text-[#3F3F50]">
                <span className="block">“Life is God’s gift to us. What</span>
                <span className="block">we do with our work is our</span>
                <span className="block text-[#7A1F3D] font-semibold">
                  Gift to God.”
                </span>
              </h2>

              <button className="mt-6 inline-flex min-w-[140px] items-center justify-center border border-[#7A1F3D] bg-transparent px-7 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-medium text-[#7A1F3D] transition-all duration-300 hover:bg-[#7A1F3D] hover:text-white sm:mt-7 sm:min-w-[160px] cursor-pointer active:scale-95 rounded-sm">
                Shop Now
              </button>
            </div>
          </div>


          <div className="order-3 flex justify-center lg:justify-end lg:mr-0">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952018/Life%20is%20God%E2%80%99s%20gift%20to%20us.png"
              alt="Decorative floral poshak set"
              className="h-[282px] w-[400px] max-w-full object-contain object-right lg:mt-12"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


