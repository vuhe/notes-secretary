import { useChat as useAiChat } from "@ai-sdk/react";
import { type FormEvent, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNavigation } from "@/hooks/use-navigation";
import { usePrompt } from "@/hooks/use-prompt";
import { Agent } from "@/lib/agent";
import { safeError, safeErrorString } from "@/lib/errors";
import { loadChat } from "@/lib/invoke";

export function useChat() {
  const id = useNavigation((state) => state.id);

  const { messages, sendMessage, status, setMessages, stop, error, clearError } = useAiChat({
    id: id,
    transport: new Agent(),
  });

  useEffect(() => {
    if (id !== useNavigation.getState().id) return;
    if (!useNavigation.getState().loading) return;

    loadChat(id)
      .then((messages) => {
        if (id !== useNavigation.getState().id) return;
        setMessages(messages);
        useNavigation.getState().updateLoading(id, false);
      })
      .catch((error: unknown) => {
        if (id !== useNavigation.getState().id) return;
        useNavigation.getState().updateLoading(id, safeError(error));
      });
  }, [id, setMessages]);

  const retryLoading = () => {
    const capturedId = id;
    useNavigation.getState().updateLoading(id, true);

    loadChat(capturedId)
      .then((messages) => {
        if (capturedId !== useNavigation.getState().id) return;
        setMessages(messages);
        useNavigation.getState().updateLoading(capturedId, false);
      })
      .catch((error: unknown) => {
        if (capturedId !== useNavigation.getState().id) return;
        useNavigation.getState().updateLoading(capturedId, safeError(error));
      });
  };

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
    retryLoading,
    messages,
    status,
    error,
    handleSubmit,
  };
}
