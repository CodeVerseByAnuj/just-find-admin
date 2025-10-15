"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Background from '/public/images/backgrounds/welcome-bg.png';

const WelcomeBox = () => {
  return (
    <>
      <CardBox className="bg-primary dark:bg-primary pb-0">
        <div className="grid grid-cols-12">
          <div className="md:col-span-7 col-span-12">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-tw bg-white flex items-center justify-center shrink-0">
                <Icon
                  icon="mdi:school-outline"
                  className="text-dark opacity-70"
                  height={24}
                />
              </div>
              <h5 className="text-xl text-white">Welcome to Thapar Institute</h5>
            </div>

            <div className="flex w-full xl:mt-12 sm:mt-12 lg:mt-6 mt-6">
              <div className="border-e border-white/20 pe-4">
                <p className="text-white opacity-75 text-sm mb-1">Total Students</p>
                <h2 className="text-white text-2xl">12,500+</h2>
              </div>
              <div className="ps-4">
                <p className="text-white opacity-75 text-sm mb-1">Ongoing Courses</p>
                <h2 className="text-white text-2xl">320</h2>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 col-span-12 md:ms-auto ms-auto me-auto">
            <Image
              src={Background}
              alt="Welcome Background"
              className="-mb-n5 rtl:scale-x-[-1] xl:max-w-[170px] lg:max-w-36 md:max-w-36 max-w-32 lg:ps-4 md:pt-0 pt-6"
            />
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default WelcomeBox;
