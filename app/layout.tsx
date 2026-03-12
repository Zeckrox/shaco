import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata = {
  title: "Shaco Core",
  description: "Organigrama del equipo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${spaceGrotesk.className} bg-[#0d1117] text-[#e6edf3] antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
