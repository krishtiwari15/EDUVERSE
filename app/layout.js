import { Fredoka, Quicksand, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

// Fredoka/Quicksand: the mentors' voice — mentor names, badges, celebratory
// moments. Space Grotesk/Inter: the product's voice — everything else.
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", weight: ["400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "EduVerse — Your AI Learning Universe",
  description: "A personal AI learning universe: tutors, mentors, and a path built around you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${quicksand.variable} ${spaceGrotesk.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-body), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}