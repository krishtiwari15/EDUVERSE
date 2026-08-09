import { Fredoka, Quicksand } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "EduVerse",
  description: "Your AI learning buddy in a moonlit galaxy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${quicksand.variable}`} style={{ fontFamily: "var(--font-quicksand), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}