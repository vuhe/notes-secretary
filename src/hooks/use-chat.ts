import { useChat as useAiChat } from "@ai-sdk/react";
import { type FormEvent, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNavigation } from "@/hooks/use-navigation";
import { usePrompt } from "@/hooks/use-prompt";
import { Agent } from "@/lib/agent";
import { safeErrorString } from "@/lib/errors";

export function useChat() {
  const id = useNavigation((state) => state.id);
  const requireLoading = useNavigation((state) => state.requireLoading);

  const { messages, sendMessage, status, setMessages, stop, error, clearError } = useAiChat({
    id: id,
    transport: new Agent(),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: 监听 requireLoading 变化
  useEffect(() => {
    const state = useNavigation.getState();
    if (!state.requireLoading || state.loading) return;
    void state.loadMessages(setMessages);
  }, [requireLoading, setMessages]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "submitted" || status === "streaming") {
        void stop();
        return;
      }

      if (status === "error") {
        clearError();
        return;
      }

      usePrompt
        .getState()
        .submit(id)
        .then((submitted) => {
          if (!submitted) return;
          void sendMessage(submitted.message, submitted.options);
        })
        .catch((error: unknown) => {
          toast.warning("发送失败", {
            description: safeErrorString(error),
            closeButton: true,
          });
        });
    },
    [id, status, stop, clearError, sendMessage],
  );

  return {
    messages,
    status,
    error,
    handleSubmit,
  };
}
