//For sections required in every page; like Navbars or footers
import { Jost } from "next/font/google";
import "./globals.css";

//Components
import NavWrapper from "./components/NavWrapper";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./components/ThemeProvider";

const jost = Jost({ subsets: ["latin"] });    //Instance of font

export const metadata = {
  title: "MyHelpdesk",
  description: "Your IT Support Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jost.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <NavWrapper />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 m-0 max-w-none">
                <div className="max-w-6xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
