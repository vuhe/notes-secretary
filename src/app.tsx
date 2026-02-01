import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ChatPage } from "@/components/chat-page";
import { ChatTitle } from "@/components/chat-title";
import { ChatUsage } from "@/components/chat-usage";
import { NavSidebar } from "@/components/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/shadcn/sidebar";
import { Toaster } from "@/components/shadcn/sonner";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

export function App() {
  useEffect(() => {
    void useConfig.getState().init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider className="h-svh">
        <NavSidebar />
        <SidebarInset>
          <header
            className={cn(
              "@container/header flex w-full h-16 px-6 border-b shrink-0 items-center justify-between",
              "transition-[width,height] ease-linear",
              "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            )}
          >
            <SidebarTrigger size="default" />
            <ChatTitle className="mx-auto" />
            <ChatUsage />
          </header>

          <div className="flex-1 flex w-full min-h-0">
            <ChatPage />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
