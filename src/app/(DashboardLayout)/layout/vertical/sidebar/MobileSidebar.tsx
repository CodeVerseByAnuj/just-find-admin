"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button, Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import { SidebarContentRole1, SidebarContentRole2, SidebarContentRole3 } from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import SimpleBar from "simplebar-react";
import { Icon } from "@iconify/react";

const MobileSidebar = () => {
  const { selectedIconId, setSelectedIconId } = useContext(CustomizerContext) || {};
  const [sidebarContent, setSidebarContent] = useState(SidebarContentRole1);
  
  // Get the sidebar content based on the role id
  useEffect(() => {
    // Get user details from localStorage (client-side only)
    const getUserRole = () => {
      try {
        const userDetailsRaw = localStorage.getItem("user_details");
        if (userDetailsRaw) {
          const userDetails = JSON.parse(userDetailsRaw);
          const userRoleId = userDetails?.role_id || 0;
          // Set sidebar content based on role
          let content;
          if (userRoleId === 1) {
            content = SidebarContentRole1;
          } else if (userRoleId === 2) {
            content = SidebarContentRole2;
          } else if (userRoleId === 3) {
            content = SidebarContentRole3;
          } else {
            content = SidebarContentRole1;
          }
          setSidebarContent(content);
          // Set selected icon ID if not already set
          if (!selectedIconId && content.length > 0) {
            setSelectedIconId(content[0].id);
          }
        }
      } catch (e) {
        console.error("Error getting user role:", e);
        setSidebarContent(SidebarContentRole1);
      }
    };
    getUserRole();
  }, [selectedIconId, setSelectedIconId]);
  
  const selectedContent = sidebarContent.find(
    (data) => data.id === selectedIconId
  );
  
  const { setIsCollapse, isCollapse, isLayout, activeMode, activeDir, setActiveMode, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);

  const handleClose = () => setIsMobileSidebar(false);

  return (
    <>
      <div className="relative">
        <Button color={"ghost"} className="absolute top-1 -right-2 mobile_close_btn" onClick={handleClose}>            <Icon icon="solar:hamburger-menu-line-duotone" color="black" height={21} /></Button>

        <Sidebar
          className="fixed menu-sidebar bg-white dark:bg-darkgray transition-all pt-4 !w-full"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh-85px)] w-full">

            <SidebarItems className="ps-4 pe-4 !w-full">
              <SidebarItemGroup className="sidebar-nav">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption">
                        {item.heading}
                      </h5>
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
                  ))}
              </SidebarItemGroup>
            </SidebarItems>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default MobileSidebar;
