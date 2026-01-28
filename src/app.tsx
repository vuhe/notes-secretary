import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ChatPage } from "@/components/chat-page";
import { ChatPersona } from "@/components/chat-persona";
import { ChatTitle } from "@/components/chat-title";
import { ChatUsage } from "@/components/chat-usage";
import { NavSidebar } from "@/components/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
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
              "flex h-16 shrink-0 items-center gap-2",
              "transition-[width,height] ease-linear",
              "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            )}
          >
            <div className="flex w-full items-center gap-2 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <ChatTitle />
              <ButtonGroup className="ml-auto">
                <ChatPersona />
                <ChatUsage />
              </ButtonGroup>
            </div>
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
