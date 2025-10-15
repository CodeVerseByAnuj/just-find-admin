import React from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./css/globals.css";
import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/CustomizerContext";
import "../utils/i18n";
import NextTopLoader from 'nextjs-toploader';
import SessionTimeoutHandler from "@/app/components/SessionTimeoutHandler";
import { Toaster } from "@/app/components/shadcn-ui/Default-Ui/toaster"
const manrope = Manrope({ subsets: ["latin"] });
import { TanstackProvider } from "./ProtectedRoute/TanstackProvider";

export const metadata: Metadata = {
  title: "Thapar Institute",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        {/* <ThemeModeScript /> */}
      </head>
      <body className={`${manrope.className}`}>
        <TanstackProvider>
          <ThemeProvider theme={customTheme}>
            <NextTopLoader color="var(--color-primary)" showSpinner={false} />
            <CustomizerContextProvider>
              {/* Session timeout handler for inactivity */}
              <SessionTimeoutHandler />
              {children}
            </CustomizerContextProvider>
          </ThemeProvider>
          <Toaster />
        </TanstackProvider>
      </body>
    </html>
  );
}
