"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import { Select } from "flowbite-react";


const StudentCard = ({ data }: any) => {
  const ColorboxData = [
    {
      bg: "primary-gradient",
      icon: "mdi:book-open-variant",
      color: "bg-primary",
      title: "No of Courses",
      price: data?.totalCourses ?? "—",
      link: "#",
    },
    {
      bg: "warning-gradient",
      icon: "mdi:clipboard-text",
      color: "bg-warning",
      title: "No of Exams",
      price: data?.totalExams ?? "—",
      link: "#",
    },
    {
      bg: "secondary-gradient",
      icon: "mdi:clock-fast",
      color: "bg-secondary",
      title: "Time Saved",
      price: data?.timeSaved ?? "—",
      link: "#",
    },
  ];
  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex  gap-30">
          {ColorboxData.map((item, index) => (
            <div className="lg:basis-1/3 md:basis-1/4 basis-full lg:shrink shrink-0" key={index}>
              <div
                className={`text-center px-5 py-30 rounded-tw ${item.bg}`}
              >
                <span
                  className={`h-12 w-12 mx-auto flex items-center justify-center  rounded-tw ${item.color}`}
                >
                  <Icon
                    icon={item.icon}
                    className="text-white"
                    height={24}
                  />
                </span>
                <p className="text-ld font-normal mt-4 mb-2">
                  {item.title}
                </p>
                <h4 className="text-22">{item.price}</h4>
                {/* <Button
                      as={Link}
                      href={item.link}
                      
                     className="w-fit mx-auto mt-5 bg-white hover:bg-dark text-ld font-semibold hover:text-white shadow-sm py-1 px-1 dark:bg-darkgray dark:hover:bg-dark"
                      size="xs"
                    >
                      View Details
                    </Button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};



export default StudentCard