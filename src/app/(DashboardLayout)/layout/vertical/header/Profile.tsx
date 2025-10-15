"use client";

import { Icon } from "@iconify/react";
import { Badge, Dropdown, DropdownItem } from "flowbite-react";
import React, { useEffect, useState } from "react";
import * as profileData from "./Data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avvvatars from "avvvatars-react";

const readLocalUser = () => {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("user_details");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const Profile = () => {
  const router = useRouter();
  // initialize state from localStorage (safe for SSR)
  const [userDetails, setUserDetails] = useState<any>(() => readLocalUser());
  

  // Keep state in sync when localStorage changes (cross-tab) or when
  // we dispatch a custom event (same-tab).
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

  const handleLogout = () => {
    localStorage.clear();
    // also notify any listeners (optional)
    window.dispatchEvent(new Event("user_details_changed"));
    router.push("/auth/auth1/login");
  };

  // fallback to empty object so code below doesn't blow up
  const displayUser = userDetails || {};

  return (
    <div className="relative">
      <Dropdown
        label=""
        className="w-[220px] rounded-2xl shadow-lg border border-gray-200 dark:border-darkborder"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-auto rounded-full cursor-pointer flex items-center justify-center gap-2">
              <Avvvatars
                value={
                  (displayUser?.first_name || "") +
                  (displayUser?.last_name ? " " + displayUser.last_name : "")
                }
              />
              <div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-800 dark:text-white">
                    {displayUser?.first_name || "User"}
                  </h5>
                  <h6 className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    {displayUser?.role || "User"}
                  </h6>
                </div>
              </div>
            </div>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className="hover:text-primary text-gray-500 dark:text-primary"
              height={14}
            />
          </div>
        )}
      >
        <div className="p-3">
          <div className="flex items-center gap-3 border-b border-border pb-3 dark:border-darkborder">
            <Avvvatars
              value={
                (displayUser?.first_name || "") +
                (displayUser?.last_name ? " " + displayUser.last_name : " User")
              }
            />
            <div>
              <h5 className="text-sm font-semibold text-gray-800 dark:text-white">
                {displayUser?.first_name || "User"}
              </h5>
            </div>
          </div>

          {profileData.profileDD.map((items, index) => (
            <div key={index} className="mb-2">
              <DropdownItem
                as={Link}
                href={items.url}
                className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md"
              >
                <div className="flex items-center w-full">
                  <div className="flex gap-3 w-full">
                    <h5 className="text-15 font-normal group-hover/link:text-primary">
                      {items.title}
                    </h5>
                    {items.url === "/apps/invoice" ? <Badge color="lightprimary">4</Badge> : null}
                  </div>
                </div>
              </DropdownItem>
            </div>
          ))}

          <div>
            <button
              onClick={handleLogout}
              className="flex w-full justify-between items-center text-sm text-red-600 hover:text-red-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors duration-200"
            >
              <span>Sign Out</span>
              <Icon icon="mdi:logout" width={18} />
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
