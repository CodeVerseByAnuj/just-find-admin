"use client";
import React, { useContext } from "react";
import { ChildItem } from "../Sidebaritems";
import { Sidebar, SidebarItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CustomizerContext } from "@/app/context/CustomizerContext";

interface NavItemsProps {
  item: ChildItem;
  isParentItem?: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ item, isParentItem = false }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setIsMobileSidebar } = useContext(CustomizerContext);

  const handleMobileSidebar = () => {
    setIsMobileSidebar(false);
  };

  // Separate logic for parent and child active states
  const getActiveState = () => {
    if (isParentItem) {
      // Parent link is active if current path matches exactly or starts with the parent URL
      return pathname === item.url || pathname.startsWith(item.url + "/");
    } else {
      // Child link is active only if current path matches exactly
      return pathname === item.url;
    }
  };

  const isActive = getActiveState();

  // Separate styling logic for parent and child items
  const getItemClassName = () => {
    const baseClasses = "rounded-xl";
    
    if (isParentItem) {
      return `${baseClasses} ${
        isActive
          ? "text-white helo-123 bg-primary dark:!bg-primary hover:text-white hover:bg-primary dark:hover:text-white shadow-primary active"
          : "text-link bg-transparent group/link hover:bg-transparent dark:!bg-transparent"
      }`;
    } else {
      return `${baseClasses} ${
        isActive
          ? "text-white bg-primary dark:!bg-primary hover:text-white hover:bg-primary dark:hover:text-white shadow-primary active"
          : "text-link bg-transparent group/link hover:bg-lightgray dark:hover:bg-darkmuted hover:text-primary dark:hover:text-primary"
      }`;
    }
  };

  // Separate icon rendering logic for parent and child items
  const renderIcon = () => {
    if (item.icon) {
      return <Icon icon={item.icon} className={item.color} height={18} />;
    }

    // Different dot styling for parent vs child items
    if (isParentItem) {
      return (
        <span
          className={`h-2 w-2 rounded-full mx-1.5 ${
            isActive
              ? "bg-white dark:bg-white"
              : "bg-black/40 dark:bg-white/40 group-hover/link:bg-primary dark:group-hover/link:bg-primary"
          }`}
        />
      );
    } else {
      return (
        <span
          className={`h-[6px] w-[6px] rounded-full mx-1.5 ${
            isActive
              ? "bg-white dark:bg-white"
              : "bg-black/40 dark:bg-white/40 group-hover/link:bg-primary dark:group-hover/link:bg-primary"
          }`}
        />
      );
    }
  };

  return (
    <SidebarItem
      href={item.url}
      as={Link}
      id="sidebar-item"
      className={getItemClassName()}
    >
      <span
        onClick={handleMobileSidebar}
        className="flex gap-3 align-center items-center sidebar-links"
      >
        {renderIcon()}
        <span className="max-w-36 overflow-hidden">
          {t(`${item.name}`)}
        </span>
      </span>
    </SidebarItem>
  );
};

export default NavItems;