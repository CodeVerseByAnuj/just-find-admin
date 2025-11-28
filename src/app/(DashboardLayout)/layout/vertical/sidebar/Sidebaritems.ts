export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}


import { uniqueId } from "lodash";

const SidebarContentRole1: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    items: [
      {
        heading: "Dashboards",
        children: [
          {
            name: "Dashboard",
            icon: "solar:screencast-2-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          // {
          //   name: "Academics",
          //   icon: "solar:book-2-bold-duotone",
          //   id: uniqueId(),
          //   url: "/departments",
          //   children: [
          //     {
          //       name: "Departments",
          //       icon: "solar:buildings-bold-duotone",
          //       id: uniqueId(),
          //       url: "/departments",
          //     },
          //     {
          //       name: "Semesters",
          //       icon: "solar:calendar-bold-duotone",
          //       id: uniqueId(),
          //       url: "/semester",
          //     },
          //   ],
          // },
          {
            name: "categories",
            icon: "solar:clipboard-text-bold-duotone",
            id: uniqueId(),
            url: "/categories",
          },
          {
            name: "business",
            icon: "solar:chart-bold-duotone",
            id: uniqueId(),
            url: "/business",
          },
        ],
      },
    ],
  },
];

const SidebarContentRole2: MenuItem[] = [

  {
    id: 2,
    name: "User Dashboard",
    items: [
      {
        heading: "User Panel",
        children: [
          {
            name: "Dashboard",
            icon: "solar:screencast-2-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          {
            name: "Exams",
            icon: "solar:user-circle-bold-duotone",
            id: uniqueId(),
            url: "/exam-professor",
          },
        ],
      },
    ]
  },
];
const SidebarContentRole3: MenuItem[] = [
  {
    id: 3,
    name: "User Dashboard",
    items: [
      {
        heading: "User Panel",
        children: [
          {
            name: "Dashboard",
            icon: "solar:screencast-2-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          {
            name: "Exams",
            icon: "solar:notebook-square-bold-duotone",
            id: uniqueId(),
            url: "/exam-student",
          },
        ],
      },
    ]
  },
];


// Export both role-specific sidebar contents
export { SidebarContentRole1, SidebarContentRole2, SidebarContentRole3 };
