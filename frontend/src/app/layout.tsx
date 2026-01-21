import type { Metadata } from "next";
import { Poppins, Bebas_Neue, Righteous, Orbitron } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "HanumatFest 2026 | Sports Registration",
  description: "The ultimate inter-college sports fest. Register now for Cricket, Football, Basketball, and more!",
  keywords: ["sports fest", "college sports", "registration", "cricket", "football", "esports"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${bebasNeue.variable} ${righteous.variable} ${orbitron.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
