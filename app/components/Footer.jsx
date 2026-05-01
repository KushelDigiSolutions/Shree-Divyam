"use client";

import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1720px] bg-[#F6F6F6] text-[#4B4B5C]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 pb-8 pt-10 sm:pt-16 md:pt-16 lg:pt-[54px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.7fr_0.7fr_1fr] lg:gap-12">
          {/* Brand */}
          <div className="max-w-[355px]">
            <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774851750/shri-divyam-logo.png' alt="Shri Divyam Logo" className="h-[24px] sm:h-[38px] w-auto object-contain cursor-pointer" />

            <p className="mt-4 sm:mt-6 text-[13px] sm:text-[16px] md:text-[18px] leading-[1.6] font-gt-walsheim text-[#303030]">
              Shop God dresses online specifically the ethnic ones with Indian
              traditional mix, simply glorifies the god statues.
            </p>

            <div className="mt-6 sm:mt-7 flex items-center gap-4 text-[#173B63]">
              <a
                href="#"
                aria-label="Instagram"
                className="text-[24px] sm:text-[32px] md:text-[36px] transition hover:text-[#8B1E4D] cursor-pointer"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="X"
                className="text-[20px] sm:text-[28px] md:text-[32px] transition hover:text-[#8B1E4D] cursor-pointer"
              >
                <FaXTwitter />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-[22px] sm:text-[30px] md:text-[34px] transition hover:text-[#8B1E4D] cursor-pointer"
              >
                <FaFacebookF />
              </a>
            </div>
          </div>


          {/* Useful Links */}
          <div className="sm:pl-4">
            <h3 className="text-[17px] sm:text-[18px] font-medium text-[#09061B] font-gt-walsheim  ">
              Useful Links
            </h3>
            <ul className="mt-5 space-y-4 text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D] cursor-pointer">Our Story</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D] cursor-pointer">Explore Dresses</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#8B1E4D] cursor-pointer">Gallery</a>
              </li>
              <li>
                <a href="/contact" className="transition hover:text-[#8B1E4D] cursor-pointer">Contact us</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="sm:pl-4">
            <h3 className="text-[17px] sm:text-[18px] font-medium text-[#09061B] font-gt-walsheim ">
              Categories
            </h3>
            <ul className="mt-5 space-y-4 text-[14px] sm:text-[15px] md:text-[16px] text-gray-600">
              <li>
                <a href="/#radha-krishna-section" className="transition hover:text-[#7A1F3D] cursor-pointer">Radha Krishna</a>
              </li>
              <li>
                <a href="/#mata-rani-section" className="transition hover:text-[#7A1F3D] cursor-pointer">Mata Rani</a>
              </li>
              <li>
                <a href="/#laddu-gopal-section" className="transition hover:text-[#7A1F3D] cursor-pointer">Laddo Gopal</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="max-w-[290px]">
            <h3 className="text-[17px] sm:text-[18px] font-medium text-[#09061B] font-gt-walsheim ">
              Contact Info
            </h3>

            <p className="mt-4 text-[14px] sm:text-[15px] md:text-[16px] leading-[1.45] text-gray-500">
              Our Support team is here to assist you
            </p>

            <div className="mt-6 space-y-5 text-[14px] sm:text-[15px] md:text-[16px] text-gray-700 font-gt-walsheim">
              <div className="flex items-center gap-4 cursor-pointer hover:text-[#8B1E4D] transition group">
                <FiMail className="shrink-0 text-[18px] sm:text-[20px] text-[#8B1E4D] group-hover:scale-110 transition-transform" />
                <span>info@ShriDivyam.com</span>
              </div>

              <div className="flex items-center gap-4 cursor-pointer hover:text-[#8B1E4D] transition group">
                <FiPhone className="shrink-0 text-[18px] sm:text-[20px] text-[#8B1E4D] group-hover:scale-110 transition-transform" />
                <span>(219) 555-0114</span>
              </div>

              <div className="flex items-start gap-4 cursor-pointer hover:text-[#8B1E4D] transition group">
                <FiMapPin className="mt-1 shrink-0 text-[18px] sm:text-[20px] text-[#8B1E4D] group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">
                  3891 Ranchview Dr.
                  <br />
                  Richardson, California 62639
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 md:mt-16 flex flex-col gap-6 pt-8 text-[13px] sm:text-[14px] md:text-[15px] text-gray-500 md:flex-row md:items-center md:justify-between text-center md:text-left">
          <p>© 2026 Shri Divyam. All right Reserved</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10 justify-center">
            <a href="#" className="transition hover:text-[#8B1E4D] cursor-pointer">
              Terms And Condition
            </a>
            <a href="#" className="transition hover:text-[#8B1E4D] cursor-pointer">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}