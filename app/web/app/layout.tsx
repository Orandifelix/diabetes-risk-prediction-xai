import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Dida } from "@/components/chat/Dida";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default:  "Diabetes Risk Predictor",
    template: "%s | Diabetes Risk Predictor",
  },
  description:
    "End-to-end Type 2 diabetes risk prediction with machine learning and explainable AI.",
  keywords:  ["diabetes", "risk prediction", "machine learning", "XAI", "SHAP"],
  authors:   [{ name: "Moringa School Capstone Team 2026" }],
  openGraph: {
    title:       "Diabetes Risk Predictor",
    description: "Know your risk before it becomes your reality.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
      <Providers>
  {children}
  <Dida />
  <Toaster position="top-right" richColors closeButton />
</Providers>
      </body>
    </html>
  );
}
