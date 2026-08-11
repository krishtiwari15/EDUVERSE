import { Manrope } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";

// Single type family across the whole app — restrained silver/white
// Manrope, weight and size carry hierarchy instead of a second display face.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

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
      <body className={manrope.variable} style={{ fontFamily: "var(--font-body), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
