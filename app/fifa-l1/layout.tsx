import type { Metadata } from "next";
import { Saira_Condensed } from "next/font/google";
import "./fifa-theme.css";

const sairaCondensed = Saira_Condensed({
    variable: "--font-saira-condensed",
    weight: ["600", "700", "800"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FIFA - Ligue 1",
    description: "Wordle"
}

export default function FifaPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sairaCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}