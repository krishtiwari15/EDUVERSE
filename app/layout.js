import { Manrope, Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";

// Manrope remains the type family for the pre-login flow (landing/login/
// preferences — see .app-light in globals.css for the scoped exception).
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
// Instrument Serif (display) + Inter (body) — used only inside the
// in-app ".app-light" scope, not the onboarding flow above.
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "EduVerse — Your AI Learning Universe",
  description: "A personal AI learning universe: tutors, mentors, and a path built around you.",
};

// viewportFit: "cover" lets content draw under notches/home indicators so
// the safe-area-inset-* env() variables used throughout the app actually
// resolve to real values instead of 0.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${instrumentSerif.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-body), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
