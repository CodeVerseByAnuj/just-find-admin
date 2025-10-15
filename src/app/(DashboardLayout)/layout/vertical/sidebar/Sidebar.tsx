"use client";
import React, { useContext, useEffect, useState } from "react";
import { Drawer, Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import { SidebarContentRole1, SidebarContentRole2, SidebarContentRole3 } from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import SimpleBar from "simplebar-react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Avvvatars from "avvvatars-react";
import { Icon } from "@iconify/react";

const readLocalUser = () => {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("user_details");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};


const SidebarLayout = () => {
  const { selectedIconId, setSelectedIconId } =
    useContext(CustomizerContext) || {};
  const [roleId, setRoleId] = useState(0);
  const [sidebarContent, setSidebarContent] = useState(SidebarContentRole1);
  const [userDetails, setUserDetails] = useState<any>(() => readLocalUser());



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
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user_details") {
        setUserDetails(e.newValue ? JSON.parse(e.newValue) : {});
      }
    };

    // custom event for same-tab updates (since 'storage' doesn't fire in the same tab)
    const handleCustom = () => {
      setUserDetails(readLocalUser());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("user_details_changed", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user_details_changed", handleCustom);
    };
  }, []);


  // Get the sidebar content based on the role id
  useEffect(() => {
    // Get user details from localStorage (client-side only)
    const getUserRole = () => {
      try {
        const userDetailsRaw = localStorage.getItem("user_details");
        if (userDetailsRaw) {
          const userDetails = JSON.parse(userDetailsRaw);
          const userRoleId = userDetails?.role_id || 0;
          setRoleId(userRoleId);
          // Set sidebar content based on role
          if (userRoleId === 1) {
            setSidebarContent(SidebarContentRole1);
          } else if (userRoleId === 2) {
            setSidebarContent(SidebarContentRole2);
          } else if (userRoleId === 3) {
            setSidebarContent(SidebarContentRole3);
          } else {
            setSidebarContent(SidebarContentRole1);
          }
        }
      } catch (e) {
        console.error("Error getting user role:", e);
        setRoleId(0);
        setSidebarContent(SidebarContentRole1);
      }
    };

    getUserRole();
  }, []);

  const selectedContent = sidebarContent.find(
    (data) => data.id === selectedIconId
  );

  const pathname = usePathname();

  function findActiveUrl(narray: any, targetUrl: any) {
    for (const item of narray) {
      // Check if the `items` array exists in the top-level object
      if (item.items) {
        // Iterate through each item in the `items` array
        for (const section of item.items) {
          // Check if `children` array exists and search through it
          if (section.children) {
            for (const child of section.children) {
              if (child.url === targetUrl) {
                return item.id; // Return the ID of the first-level object
              }
            }
          }
        }
      }
    }
    return null; // URL not found
  }

  useEffect(() => {
    const result = findActiveUrl(sidebarContent, pathname);
    if (result) {
      setSelectedIconId(result);
    } else {
      // If no match is found, default to the role's sidebar ID
      if (sidebarContent && sidebarContent.length > 0) {
        setSelectedIconId(sidebarContent[0].id);
      }
    }
  }, [pathname, setSelectedIconId, sidebarContent]);

  const displayUser = userDetails || {};

  return (
    <>
      <div className="xl:block hidden">
        {/* <div className="minisidebar-icon border-e border-ld  fixed start-0 z-1">
          <IconSidebar />
        </div> */}
        <Sidebar
          className="fixed menu-sidebar !bg-[#f4f7fb] dark:bg-darkgray rtl:pe-4 rtl:ps-0 z-9"
          aria-label="Sidebar with multi-level dropdown example "
        >
          <Link href={'/'} className="px-2 ps-5 py-2 flex items-center gap-2 sidebarlogo mt-3">
            <FullLogo />
            <span className="flex flex-col logo-text">
              <span className="text-[14px] tracking-[1.4px] text-red-700 font-semibold font-serif">Thapar Institute</span>
              <span className="text-[10px] font-serif">of Engineering and Technology</span>
            </span>
          </Link>
          <SimpleBar className="h-[calc(100vh-85px)]">
            <SidebarItems className="pe-6 rtl:pe-0 rtl:ps-4 px-2 mt-2">
              <SidebarItemGroup className="sidebar-nav hide-menu">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <div className="caption" key={item.heading}>
                      <React.Fragment key={index}>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            {child.children ? (
                              <NavCollapse item={child} />
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </SidebarItemGroup>
            </SidebarItems>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;

