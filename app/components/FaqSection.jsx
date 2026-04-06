"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    question: "What is your design process like?",
    answer:
      "Our design process begins with a deep understanding of traditional aesthetics and modern craftsmanship. We sketch initial concepts, select premium fabrics, and then our master artisans execute the intricate hand-embroidery to create a unique piece.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 5-7 business days within India. International shipping can take 10-15 business days depending on the destination and customs processing.",
  },
  {
    question: "Do you offer custom sizing?",
    answer: "Yes, we specialize in custom sizing for all our deity dresses. You can provide specific measurements of your idol, and we will tailor the dress to ensure a perfect fit.",
  },
  {
    question: "What materials do you use for the dresses?",
    answer: "We use only the finest materials including pure silk, velvet, organza, and high-quality cotton. All our embellishments like Gota Patti and Zardosi are made with premium threads and stones.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mx-auto max-w-[1720px] bg-white py-12  sm:py-14 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24">
        <div className="max-w-[1120px]">
          {/* Header */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <p className="text-[32px] font-gt-walsheim font-semibold tracking-[-0.01em] text-[#7A1F3D]">
              FAQ
            </p>
            <h2 className="mt-2 font-playfair text-[45px] font-bold leading-[1.15] text-[#0A243F] sm:text-[42px] md:text-[48px] lg:text-[52px]">
              Most asked questions
            </h2>
          </div>

          {/* FAQ List */}
          <div className="border-t border-[#E5E7EB]">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-b border-[#E5E7EB] py-5 sm:py-6 md:py-7"
                >
                  <div 
                    className="flex cursor-pointer items-start justify-between gap-4"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex-1 pr-2">
                      <h3 className="text-[17px] font-semibold font-gt-walsheim leading-[1.45] text-[#0A243F] sm:text-[20px]">
                        {item.question}
                      </h3>

                      {isOpen && (
                        <p className="mt-4 max-w-[980px] text-[14px] font-gt-walsheim font-light leading-[1.6] text-[#4B5563] sm:text-[15px]">
                          {item.answer}
                        </p>
                      )}
                    </div>

                    <button
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[#17304D]"
                      aria-label={isOpen ? "Collapse FAQ" : "Expand FAQ"}
                    >
                      {isOpen ? (
                        <ChevronUp size={20} strokeWidth={2} />
                      ) : (
                        <ChevronDown size={20} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}