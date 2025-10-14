// /app/layout.tsx
import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from 'react-hot-toast'; // <-- Import Toaster
import "./globals.css";

const kanit = Kanit({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Battle of Talingchan Deck Builder",
  description: "Create and manage your Battle of Talingchan decks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={kanit.className}>
        {/* --- เพิ่ม Toaster ที่นี่ --- */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}