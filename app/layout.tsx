import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Shaco Organigram",
  description: "Modern Organizational Chart Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-slate-950 text-slate-200 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
