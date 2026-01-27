import { useConfig } from "@/hooks/use-config";
import { useNavigation } from "@/hooks/use-navigation";

function chatTitle(id: string) {
  return useConfig.getState().chats.find((chat) => chat.id === id)?.title;
}

export function ChatTitle() {
  const id = useNavigation((state) => state.id);
  const title = chatTitle(id);
  if (title) return <span className="truncate">{title}</span>;
  return <span className="text-muted-foreground">新对话</span>;
}
