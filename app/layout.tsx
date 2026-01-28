"use client";

import "./global.css";
import Head from "next/head";
import { ThemeModeScript } from "flowbite-react";
import { ContextProvider } from "@/utils/context/Context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <ThemeModeScript />
      </Head>
      <body className={`antialiased `}>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
