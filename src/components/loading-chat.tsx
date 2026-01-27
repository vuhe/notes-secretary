import { Loader2Icon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";

export function LoadingChat() {
  return (
    <Empty className="select-none">
      <EmptyContent>
        <EmptyDescription className="flex items-center justify-center gap-2">
          <Loader2Icon className="size-8 animate-spin" />
          <span className="text-2xl">正在加载对话……</span>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
