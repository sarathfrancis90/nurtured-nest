import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nurtured Nest | Professional Birth Doula",
  description: "Nurtured Nest by Varshitha offers emotional and physical birth doula support, advocacy, and comfort techniques."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
