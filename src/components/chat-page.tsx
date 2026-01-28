import { AlertCircleIcon, Loader2Icon, MessageSquareIcon, TriangleAlertIcon } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useChat } from "@/hooks/use-chat";
import { useNavigation } from "@/hooks/use-navigation";
import { safeErrorString } from "@/lib/errors";

function MainContainer(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="@container/main flex flex-col min-h-0 size-full max-w-190"
      {...props}
    />
  );
}

function LoadingChat() {
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

function ChatEmpty({ empty }: { empty: boolean }) {
  if (!empty) return null;

  return (
    <ConversationEmptyState
      icon={<MessageSquareIcon className="size-6" />}
      title="新对话"
      description="向 Agent 发送消息以开始对话"
    />
  );
}

export function ChatPage() {
  const loading = useNavigation((state) => state.loading);
  const { retryLoading, messages, status, error, handleSubmit } = useChat();

  return (
    <AnimatePresence mode="wait">
      {loading === true ? (
        <MainContainer key="loading">
          <LoadingChat />
        </MainContainer>
      ) : loading === false ? (
        <MainContainer key="content">
          <Conversation className="h-full">
            <ConversationContent>
              <ChatEmpty empty={messages.length === 0} />
              <ChatMessages messages={messages} status={status} />
              {status === "submitted" && (
                <div className="inline-flex items-center justify-center text-muted-foreground gap-1">
                  <Loader2Icon className="size-4 animate-spin" />
                  <span className="text-sm">正在加载……</span>
                </div>
              )}
              {status === "error" && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>遇到错误！</AlertTitle>
                  {error && <AlertDescription>{safeErrorString(error)}</AlertDescription>}
                </Alert>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <ChatInput status={status} handleSubmit={handleSubmit} />
        </MainContainer>
      ) : (
        <MainContainer key="error">
          <Empty className="select-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlertIcon />
              </EmptyMedia>
              <EmptyTitle>对话加载错误</EmptyTitle>
              <EmptyDescription>{loading.message}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={retryLoading}>重试</Button>
            </EmptyContent>
          </Empty>
        </MainContainer>
      )}
    </AnimatePresence>
  );
}
