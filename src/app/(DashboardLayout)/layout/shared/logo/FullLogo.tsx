"use client";
import React from "react";
import Image from "next/image";
import Logo from "/public/images/logos/logo_thapar.png";
const FullLogo = () => {
  return (
      <Image src={Logo} alt="logo" className="block w-auto h-8 object-contain text-left" />
  );
};

export default FullLogo;
