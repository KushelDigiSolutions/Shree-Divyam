"use client";

export default function GiftSection() {
  return (
    <section className="mx-auto max-w-[1720px] relative overflow-hidden w-full lg:h-[410px] h-auto bg-[#F7F0E5] py-16 lg:py-0">
      {/* Top Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-[50px] z-10 pointer-events-none overflow-hidden">
        <div 
          className="w-full h-full bg-repeat-x bg-contain opacity-80"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      {/* Bottom Decorative Border */}
      <div className="absolute bottom-0 left-0 w-full h-[50px] z-10 pointer-events-none overflow-hidden">
        <div 
          className="w-full h-full bg-repeat-x bg-contain opacity-80 rotate-180"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1775201523/%E2%80%9CLife%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our.png")' }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">

          <div className="order-2 flex justify-right lg:order-1 lg:justify-start">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952010/Life%20is%20God%E2%80%99s%20gift%20to%20us.%20What%20we%20do%20with%20our%20work%20is%20our%20Gift%20to%20God..png"
              alt="Decorative floral poshak set"
              className="h-[282px] w-[220px] max-w-full object-contain mx-auto lg:mt-12 sm:w-[250px] md:w-[270px] lg:w-[390px] xl:w-[415px]"
            />
          </div>


          <div className="order-1 text-center lg:order-2">
            <div className="mx-auto max-w-[760px]">
              <h2 className="font-gt-walsheim text-[26px] lg:mt-20 font-right leading-[1.34] tracking-[-0.02em] text-[#3F3F50] sm:text-[34px] md:text-[42px] lg:text-[40px]">
                <span className="block">“Life is God’s gift to us. What</span>
                <span className="block">we do with our work is our</span>
                <span className="block text-[#7A1F3D] font-semibold">
                  Gift to God.”
                </span>
              </h2>

              <button className="mt-6 inline-flex min-w-[148px] items-center justify-center border border-[#B86A80] bg-transparent px-7 py-3 text-[15px] font-medium text-[#8A214C] transition hover:bg-[#8A214C] hover:text-white sm:mt-7 sm:min-w-[160px] sm:px-8">
                Shop Now
              </button>
            </div>
          </div>


          <div className="order-3 flex justify-center lg:justify-end">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774952018/Life%20is%20God%E2%80%99s%20gift%20to%20us.png"
              alt="Decorative floral poshak set"
              className="h-auto w-[220px] max-w-full lg:mt-12 object-contain sm:w-[250px] md:w-[270px] lg:w-[290px] xl:w-[315px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}