import "./globals.css";
import localFont from "next/font/local";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// GANEY — the single, project-wide font (self-hosted variable font).
// Swap fonts/Ganey.woff2 for a real GANEY file later and nothing else changes.
const ganey = localFont({
  src: "../fonts/Ganey.woff2",
  variable: "--font-ganey",
  display: "swap",
  weight: "200 800",
});

export const metadata = {
  title: {
    default: "ChainFolio — Crypto Portfolio & Analytics Studio",
    template: "%s — ChainFolio",
  },
  description:
    "A 3-page Web3 frontend: landing, live analytics dashboard (CoinGecko API) and a mock transaction history — with auth, global wallet state and proper async handling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ganey.variable}>
      <body>
        <AuthProvider>
          <WalletProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
