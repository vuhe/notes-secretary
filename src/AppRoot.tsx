import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { LoadingChat } from "@/components/loading-chat";
import { NavSidebar } from "@/components/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useConfig } from "@/hooks/use-config";

export function App() {
  useEffect(() => {
    void useConfig.getState().init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <NavSidebar />
        <LoadingChat />
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
