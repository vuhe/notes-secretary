import { Loader2Icon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LoadingChat() {
  return (
    <SidebarInset key="loading-chat">
      <header
        className={cn(
          "flex h-16 shrink-0 items-center gap-2",
          "transition-[width,height] ease-linear",
          "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        )}
      >
        <div className="flex w-full items-center gap-2 px-6">
          <SidebarTrigger className="-ml-1 mr-2" />
        </div>
      </header>

      <div className="@container/main flex flex-1 items-center justify-center min-h-0">
        <Empty>
          <EmptyContent>
            <EmptyDescription className="flex items-center justify-center gap-2">
              <Loader2Icon className="size-8 animate-spin" />
              <span className="text-2xl">正在加载对话……</span>
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </div>
    </SidebarInset>
  );
}
