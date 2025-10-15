"use client";
import Image from "next/image";
import React from "react";
import Bgimg from "/public/images/logos/logo-icon.svg";
import { Button } from "flowbite-react";

const LeftSidebarPart = () => {
  return (
    <>
      <div className="circle-top"></div>
      <div>
        <Image src={Bgimg} alt="Thapar Institute Logo" className="circle-bottom" />
      </div>
      <div className="flex xl:justify-start justify-center xl:ps-60 h-screen items-center z-10 relative">
        <div className="max-w-lg">
          <h2 className="text-white text-40 font-bold leading-[normal]">
            Welcome to Thapar Institute of Engineering <br /> & Technology
          </h2>
          <p className="opacity-75 text-white my-4 text-base font-medium">
            Empowering minds through innovation, research, and academic excellence.
            Your gateway to a future full of opportunities.
          </p>
        </div>
        
      </div>
    </>
  );
};

export default LeftSidebarPart;
