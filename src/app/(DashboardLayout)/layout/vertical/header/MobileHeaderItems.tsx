"use client";
import { Icon } from "@iconify/react";
import Notifications from "./Notifications";
import Profile from "./Profile";
import { Language } from "./Language";
import { Navbar } from "flowbite-react";
import AppLinks from "./AppLinks";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import { useContext } from "react";

const MobileHeaderItems = () => {
  const { activeMode, setActiveMode } = useContext(CustomizerContext);

  const toggleMode = () => {
    setActiveMode((prevMode: string) =>
      prevMode === "light" ? "dark" : "light"
    );
  };
  return (
    <Navbar
      fluid
      className="rounded-none bg-white dark:bg-darkgray flex-1 px-9 "
    >
      {/* Toggle Icon   */}

      {/* <div className="xl:hidden block w-full">
          <Profile />
      </div> */}
    </Navbar>
  );
};

export default MobileHeaderItems;
