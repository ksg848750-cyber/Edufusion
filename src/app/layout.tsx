import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { XPToastProvider } from "@/components/gamification/XPToast";

export const metadata: Metadata = {
  title: "EduFusion — Learn Through What You Love",
  description:
    "AI-powered contextual learning platform that explains complex concepts using real-world analogies from things you love — movies, cricket, anime, gaming, and more.",
  keywords: [
    "AI learning",
    "personalized education",
    "analogies",
    "cricket",
    "anime",
    "gaming",
    "EduFusion",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <XPToastProvider>
            {children}
          </XPToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
