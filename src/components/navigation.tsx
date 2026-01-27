import { MessageSquarePlusIcon, MoreHorizontal } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useConfig } from "@/hooks/use-config";
import { useNavigation } from "@/hooks/use-navigation";

function NavChats() {
  const chatId = useNavigation((state) => state.id);
  const chats = useConfig((state) => state.chats);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {chats.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={item.id === chatId}
              onClick={() => {
                useNavigation.getState().loadChat(item.id);
              }}
            >
              {item.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavSidebar() {
  const goToNewChat = () => {
    useNavigation.getState().newChat();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={goToNewChat}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <MessageSquarePlusIcon className="size-4" />
          </div>
          <div className="flex-1 text-left text-lg leading-tight">开启新对话</div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavChats />
      </SidebarContent>
    </Sidebar>
  );
}
