import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "לוח מעקב סגירת חודש",
  description: "כלי פנימי למשרד רואי חשבון",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
