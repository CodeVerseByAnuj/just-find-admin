import BreadcrumbComp from "../layout/shared/breadcrumb/BreadcrumbComp";
import Profile from "@/app/components/our-pages/userProfile/Profile";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "user Profile",
  description: "User Profile Page",
};

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "User Profile",
  },
];
const Accountsettings = () => {
  return (
    <>
      <BreadcrumbComp title="User Profile" items={BCrumb} />
      <Profile />
    </>
  );
};

export default Accountsettings;

