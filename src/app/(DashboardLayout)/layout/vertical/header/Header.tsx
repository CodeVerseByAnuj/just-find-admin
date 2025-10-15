"use client";
import React, { useState, useEffect, useContext } from "react";
import { DrawerItems, Navbar, NavbarCollapse } from "flowbite-react";
import Search from "./Search";
import { Icon } from "@iconify/react";
import AppLinks from "./AppLinks";
import Notifications from "./Notifications";
import Profile from "./Profile";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import { Language } from "./Language";
import FullLogo from "../../shared/logo/FullLogo";
import MobileHeaderItems from "./MobileHeaderItems";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import HorizontalMenu from "../../horizontal/header/HorizontalMenu";
import Link from "next/link";

interface HeaderPropsType {
  layoutType: string;
}

const Header = ({ layoutType }: HeaderPropsType) => {
  const [isSticky, setIsSticky] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const hours = new Date().getHours();

    let msg = "Hello";
    if (hours < 12) {
      msg = "Good Morning";
    } else if (hours < 17) {
      msg = "Good Afternoon";
    } else {
      msg = "Good Evening";
    }
    // read user details from localStorage only on the client
    let name = "User";
    if (typeof window !== "undefined") {
      try {
        const userDetailsRaw = localStorage.getItem("user_details");
        const ud = userDetailsRaw ? JSON.parse(userDetailsRaw) : null;
        if (ud) {
          setUserDetails(ud);
          name = ud.name || name;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    setGreeting(`${msg}, ${name}`);
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // userDetails is populated in useEffect from localStorage (client-side only)

  const { setIsCollapse, isCollapse, isLayout, activeMode, activeDir, setActiveMode, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);

  const [mobileMenu, setMobileMenu] = useState("");

  const handleMobileMenu = () => {
    if (mobileMenu === "active") {
      setMobileMenu("");
    } else {
      setMobileMenu("active");
    }
  };

  const toggleMode = () => {
    setActiveMode((prevMode: string) =>
      prevMode === "light" ? "dark" : "light"
    );
  };

  // mobile-sidebar

  const handleClose = () => setIsMobileSidebar(false);
  return (
    <>
      <header
        className={`top-0 z-5  ${isSticky
          ? "bg-white dark:bg-darkgray sticky header-sticky"
          : "bg-transparent"
          }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-[15px] px-2 ${layoutType == "horizontal" ? "container mx-auto px-6!" : ""
            }  ${isLayout == "full" ? "max-w-full! " : ""}`}
        >
          {/* Mobile Toggle Icon */}
          <span
            onClick={() => setIsMobileSidebar(true)}
            className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
          >
            <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
          </span>
          {/* Toggle Icon   */}
          <NavbarCollapse className="xl:block ">
            <div className="flex gap-3 items-center relative">
              {layoutType == "horizontal" ? (
                <div className="me-3">
                  <FullLogo />
                </div>
              ) : null}
            </div>
          </NavbarCollapse>

          {/* mobile-logo */}
          <div className="block xl:hidden">
            <FullLogo />
          </div>

          <NavbarCollapse className="xl:block hidden !w-full">
            <div className="flex gap-3 items-center justify-between w-full">
              {/* Notification Dropdown */}
              {/* <Notifications /> */}

              {/* Profile Dropdown */}

              {/* <FullLogo /> */}
              {/* <h2 className="text-lg w-auto bg-[#f4f7fb] text-[#00357c] p-2 px-4 rounded-md font-bold" color="primary">{userDetails?.role}</h2> */}
              {/* <h2 className="text-lg w-auto text-[#00357c] p-2 px-4 rounded-md font-bold" color="primary">{userDetails?.role}</h2> */}
              <div className="flex gap-4 items-center">
                <Link
                  href="#"
                  className="nav-link lg:block hidden"
                  onClick={() => {
                    if (isCollapse === "full-sidebar") {
                      setIsCollapse("mini-sidebar");
                    } else {
                      setIsCollapse("full-sidebar");
                    }
                  }}
                >
                  <Icon
                    icon={`solar:hamburger-menu-linear`}
                    height={24}
                    width={24}
                    className="text-black dark:text-white dark:hover:text-primary lg:block hidden"
                  />
                </Link>
                <div>
                  <h2 className="text-md font-semibold">{greeting}</h2>
                  <p className="text-xs text-gray-500">Welcome back, nice to see you again!</p>
                </div>
              </div>
              <Profile />
            </div>
          </NavbarCollapse>
          {/* Mobile Toggle Icon */}
          <span
            className="h-10 w-10 flex xl:hidden justify-center items-center cursor-pointer"
            onClick={handleMobileMenu}
          >
            <Profile />
          </span>
        </Navbar>
        {/* Horizontal Menu  */}
        {layoutType == "horizontal" ? (
          <div className="xl:border-t xl:border-ld">
            <div
              className={`${isLayout == "full" ? "w-full px-6" : "container"}`}
            >
              <HorizontalMenu />
            </div>
          </div>
        ) : null}
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isMobileSidebar} onClose={handleClose} className={`${isCollapse === "full-sidebar" ? 'w-80' : 'w-0'}`} position={activeDir === "ltr" ? "left" : "right"} >
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;
