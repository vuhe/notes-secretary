import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ChatPage } from "@/components/chat-page";
import { ChatPersona } from "@/components/chat-persona";
import { ChatTitle } from "@/components/chat-title";
import { ChatUsage } from "@/components/chat-usage";
import { NavSidebar } from "@/components/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
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
              "@container/header flex w-full h-16 px-6 shrink-0 items-center justify-between",
              "transition-[width,height] ease-linear",
              "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            )}
          >
            <ButtonGroup>
              <ButtonGroup>
                <SidebarTrigger size="default" variant="outline" />
              </ButtonGroup>
              <ButtonGroup className="flex justify-center text-lg">
                <ChatTitle />
              </ButtonGroup>
            </ButtonGroup>

            <ButtonGroup>
              <ChatPersona />
              <ChatUsage />
            </ButtonGroup>
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
