import type { Metadata } from "next";
import { Saira_Condensed } from "next/font/google";
import "./cs2-theme.css";

const sairaCondensed = Saira_Condensed({
  variable: "--font-saira-condensed",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Counter-Strike 2 — Hub",
  description: "Hub des mini-jeux Counter-Strike 2 : Wordle et Guessr.",
};

export default function CsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${sairaCondensed.variable} theme-cs2 bg-background text-foreground min-h-full font-sans`}
    >
      {children}
    </div>
  );
}
