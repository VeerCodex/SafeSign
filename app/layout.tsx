import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SafeSign | AI Smart Contract Safety Sentinel on Monad",
  description: "Explain what any smart contract does in plain English before you sign or buy. Real-time AI security audits recorded immutably on Monad Testnet.",
  keywords: ["Monad", "Smart Contract Audit", "Web3 Security", "Gemini AI", "Honeypot detector", "SafeSign"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080a0f] text-gray-100 antialiased selection:bg-[#836ef9]/30 selection:text-white">
        <WalletProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
