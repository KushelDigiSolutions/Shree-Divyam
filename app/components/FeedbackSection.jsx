"use client";

"use client";

const feedback = [
  {
    quote: "Supporting Sri Divyam has been a truly uplifting experience. Knowing that my contribution helps feed the needy and spread devotion brings deep satisfaction to my heart.”",
    name: "Jerome Bell",
    location: "India",
  },
  {
    quote: "Your support empowers countless devotees. Thank you for being part of our mission. Your generosity helps us reach more households,  and spread divine love across every corner of our community. ",
    name: "Aisha Patel",
    location: "India",
  },
  {
    quote: "Every contribution spreads love and devotion. Grateful for this community. Your gifts enable us to host festivals, and make a real difference in countless lives. Thank you for your unwavering commitment.",
    name: "Rohit Kumar",
    location: "India",
  },
];

function QuoteIcon() {
  return (
    <svg
      viewBox="0 0 42 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[22px] w-[32px]"
      aria-hidden="true"
    >
      <path
        d="M15.099 2.246C11.166 4.064 8.728 7.01 7.787 11.084c-.213.92-.319 1.822-.319 2.707 0 3.575 1.728 5.363 5.186 5.363 1.552 0 2.84-.46 3.861-1.382 1.022-.92 1.533-2.105 1.533-3.55 0-1.304-.45-2.406-1.348-3.31-.878-.92-1.935-1.418-3.17-1.488.249-1.694 1.286-3.336 3.117-4.925l1.772-1.542L15.099 2.246ZM31.677 2.246c-3.95 1.818-6.387 4.764-7.31 8.838a12.64 12.64 0 0 0-.32 2.707c0 3.575 1.72 5.363 5.16 5.363 1.57 0 2.866-.46 3.888-1.382 1.022-.92 1.533-2.105 1.533-3.55 0-1.304-.45-2.406-1.347-3.31-.88-.92-1.936-1.418-3.171-1.488.248-1.694 1.286-3.336 3.117-4.925l1.773-1.542-3.323-.711Z"
        stroke="#C24E43"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FeedbackSection() {
  return (
    <section className="mx-auto max-w-[1720px] bg-[#FFFFFF] pt-10 sm:pt-16 md:pt-20 lg:pt-[88px] pb-8 sm:pb-10 md:pb-12 lg:pb-[56px]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="mb-8 text-center sm:mb-12 md:mb-14">
          <h2 className="font-serif text-[20px] sm:text-[34px] md:text-[40px] lg:text-[46px] font-playfair font-semibold leading-tight text-[#303030]">
            Customer Feedback
          </h2>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-300">
          {feedback.map((item, index) => (
            <article
              key={index}
              className="rounded-[20px] sm:rounded-[28px] border border-[#EDEDED] bg-white px-5 py-6 sm:px-6 sm:py-7 md:px-7 md:py-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="mb-4">
                <img
                  src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1776164709/Customer%20Feedback.png"
                  alt="Quote Icon"
                  className="h-[28px] sm:h-[32px] w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <p className="w-full text-[14px] sm:text-[15px] leading-relaxed font-medium font-gt-walsheim text-gray-700">
                {item.quote}
              </p>

              <div className="my-5 h-px w-full bg-[#F0F0F0]" />

              <div className="flex flex-col">
                <h3 className="text-[17px] sm:text-[18px] font-semibold leading-none text-[#1E1E2D]">{item.name}</h3>

              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}