"use client";

import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1720px] bg-[#F6F6F6] text-[#4B4B5C]">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24 pb-8 pt-14 md:pt-16 lg:pt-[54px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.7fr_0.7fr_1fr] lg:gap-12">
          {/* Brand */}
          <div className="max-w-[355px]">
           <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774851750/shri-divyam-logo.png' alt="Shri Divyam Logo" className="h-[38px] w-[180px] object-contain" />

            <p className="mt-6 text-[18px] leading-[1.55] font-gt-walsheim text-[#303030] sm:text-[16px]">
              Shop God dresses online specifically the ethnic ones with Indian
              traditional mix, simply glorifies the god statues.
            </p>

            <div className="mt-7 flex items-center gap-4 text-[#173B63]">
              <a
                href="#"
                aria-label="Instagram"
                className="text-[36px] transition hover:opacity-80"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="X"
                className="text-[32px] transition hover:opacity-80"
              >
                <FaXTwitter />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-[34px] transition hover:opacity-80"
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-[18px] font-semibold text-[#202033]">
              Useful Links
            </h3>
            <ul className="mt-5 space-y-4 text-[16px] leading-none text-[#59596A]">
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D]">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D]">
                  Explore Dresses
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D]">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D]">
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[18px] font-semibold text-[#202033]">
              Categories
            </h3>
            <ul className="mt-5 space-y-4 text-[16px] leading-none text-[#3F3F50]">
              <li>
                <a href="#" className="transition hover:text-[#7A1F3D]">
                  Radha Krishna
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#7A1F3D]">
                  Mata Rani
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#7A1F3D]">
                  Laddo Gopal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="max-w-[290px]">
            <h3 className="text-[18px] font-semibold text-[#202033]">
              Contact Info
            </h3>

            <p className="mt-4 text-[16px] leading-[1.45] text-[#4F4F5F]">
              Our Support team is here to assist you
            </p>

            <div className="mt-5 space-y-5 text-[16px] text-[#59596A]">
              <div className="flex items-center gap-4">
                <FiMail className="shrink-0 text-[20px] text-[#8B1E4D]" />
                <span>info@SriDivyam.com</span>
              </div>

              <div className="flex items-center gap-4">
                <FiPhone className="shrink-0 text-[20px] text-[#8B1E4D]" />
                <span>(219) 555-0114</span>
              </div>

              <div className="flex items-start gap-4">
                <FiMapPin className="mt-1 shrink-0 text-[20px] text-[#8B1E4D]" />
                <span className="leading-[1.35]">
                  3891 Ranchview Dr.
                  <br />
                  Richardson, California 62639
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-transparent pt-6 text-[15px] text-[#77778A] sm:mt-16 md:flex-row md:items-center md:justify-between">
          <p>@2026 Sri Divyam. All right Reserved</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
            <a href="#" className="transition hover:text-[#8B1E4D]">
              Terms And Condition
            </a>
            <a href="#" className="transition hover:text-[#8B1E4D]">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}