import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ChatTitle } from "@/components/chat-title";
import { ChatUsage } from "@/components/chat-usage";
import { LoadingChat } from "@/components/loading-chat";
import { NavSidebar } from "@/components/navigation";
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
      <SidebarProvider>
        <NavSidebar />
        <SidebarInset className="justify-center">
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
              <ChatUsage />
            </div>
          </header>

          <div className="flex-1 flex justify-center size-full">
            <div className="@container/main flex flex-col min-h-0 size-full max-w-190">
              <LoadingChat />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
