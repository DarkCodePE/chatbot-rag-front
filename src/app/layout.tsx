
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ChakraProvider} from "@chakra-ui/react";
import customTheme from "@/app/theme";
import {Providers} from "@/app/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot Educative",
  description: "Chatbot con IA para ayudarte en todo lo que necesites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es">
        <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
  );
}
