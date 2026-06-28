import "./globals.css";
import localFont from "next/font/local";
import Web3Provider from "@/components/Web3Provider";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";

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
      <head>
        {/* Apply saved theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('chainfolio_theme')||'dark';if(location.search.indexOf('noloader')>-1)document.documentElement.setAttribute('data-screenshot','1')}catch(e){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>
        <Web3Provider>
          <AuthProvider>
            <Loader />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
