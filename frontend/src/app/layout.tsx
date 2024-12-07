import type {Metadata} from "next";
import {IBM_Plex_Sans} from "next/font/google";

import "./globals.css";
import {Navbar} from "@/components/navbar/navbar";
import {Toaster} from "sonner";
import {ThemeProvider} from "@/components/theme-provider";

const ibmPlexSans = IBM_Plex_Sans({weight: "300", subsets: ["latin"]});

export const metadata: Metadata = {
    title: "FMA Brokers",
    description: "Plataforma de gestión de seguros",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body suppressHydrationWarning className={ibmPlexSans.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Navbar/>
            {children}
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    );
}
