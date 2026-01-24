import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner"
import { AppWrapper } from "@/components/layout/app-wrapper"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hanumant | Rishihood Sports Fest 2026",
  description: "Experience the spirit of strength, discipline, and fearless competition at Rishihood University's flagship sports festival. 7-8 February 2026.",
  keywords: ["sports fest", "rishihood", "hanumant", "university sports", "cricket", "football", "basketball"],
  openGraph: {
    title: "Hanumant | Rishihood Sports Fest 2026",
    description: "Experience the spirit of strength, discipline, and fearless competition at Rishihood University's flagship sports festival.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-[#ffe5cd] overflow-x-hidden">
        <AuthProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#0e0e0e',
                color: '#ffe5cd',
                border: '1px solid rgba(178, 14, 56, 0.3)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
