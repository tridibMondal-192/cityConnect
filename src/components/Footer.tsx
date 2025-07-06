import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#f4f6ff] text-[#1a1aff] p-10 flex flex-col md:flex-row justify-between items-start text-sm">
      <div className="w-full md:w-1/2 mb-10 md:mb-0">
        <h2 className="text-3xl font-bold leading-tight">
          Join City Connect in <br /> revolutionizing urban <br /> engagement.
        </h2>
      </div>

      <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
        <div className="space-y-2">
          <a href="#" className="text-[#3a3a3a] hover:underline">Privacy Policy</a><br />
          <a href="#" className="text-[#3a3a3a] hover:underline">Accessibility Statement</a><br />
          <a href="#" className="text-[#3a3a3a] hover:underline">Terms & Conditions</a><br />
          <a href="#" className="text-[#3a3a3a] hover:underline">Refund Policy</a>
        </div>

        <div className="text-[#3a3a3a]">
          <p>709, Gobra Kayasthapara</p>
          <p>Dankuni - 712702</p>
          <p>Hooghly</p>
          <p>pallabghosaliusl2003@gmail.com</p>
          <p className="text-[#1a1aff] font-semibold mt-1">+91 75959 14259</p>
        </div>
      </div>

      <div className="w-full mt-10 flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-4 text-black">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-x-twitter"></i></a>
          <a href="#"><i className="fab fa-tiktok"></i></a>
        </div>

        <div className="text-center text-xs text-[#3a3a3a]">
          <p>© 2035 by City Connect.<br />Powered and secured by <a href="#" className="underline">Wix</a>
          </p>
        </div>

        <button className="bg-[#1a1aff] text-white px-6 py-2 rounded-full shadow-md flex items-center space-x-2">
          <span>Let's Chat!</span>
        </button>
      </div>
    </footer>
  );
} 