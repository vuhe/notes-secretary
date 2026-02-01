import type { ChatStatus } from "ai";
import {
  CornerDownLeftIcon,
  GlobeIcon,
  ImageIcon,
  Loader2Icon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import {
  type ChangeEventHandler,
  type ClipboardEventHandler,
  type KeyboardEventHandler,
  type SubmitEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import { ChatPersona } from "@/components/chat-persona";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/shadcn/input-group";
import { usePrompt } from "@/hooks/use-prompt";

function PromptInputAttachments() {
  const files = usePrompt((state) => state.files);
  if (!files.length) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => usePrompt.getState().removeFile(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

function PromptInputTextarea() {
  const text = usePrompt((state) => state.text);
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      if (isComposing || e.nativeEvent.isComposing) {
        return;
      }
      if (!e.shiftKey) {
        return;
      }
      e.preventDefault();

      // Check if the Submit button is disabled before submitting
      const form = e.currentTarget.form;
      const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submitButton?.disabled) {
        return;
      }

      form?.requestSubmit();
    }

    // Remove the last attachment when Backspace is pressed and the textarea is empty
    const files = usePrompt.getState().files;
    if (e.key === "Backspace" && e.currentTarget.value === "" && files.length > 0) {
      e.preventDefault();
      const lastAttachment = files.at(-1);
      if (lastAttachment) {
        usePrompt.getState().removeFile(lastAttachment.id);
      }
    }
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    const items = event.clipboardData.items;

    const files: File[] = [];

    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      void usePrompt.getState().addFiles(files);
    }
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    usePrompt.getState().changeText(event.target.value);
  };

  return (
    <InputGroupTextarea
      className="field-sizing-content max-h-48 min-h-16 py-0"
      name="message"
      value={text}
      placeholder="询问任何问题"
      onCompositionEnd={() => {
        setIsComposing(false);
      }}
      onCompositionStart={() => {
        setIsComposing(true);
      }}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={handleChange}
    />
  );
}

function PromptInputAddFiles() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    inputRef.current?.click();
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.files) {
      usePrompt.getState().addFiles(event.currentTarget.files);
    }
    // Reset input value to allow selecting files that were previously removed
    event.currentTarget.value = "";
  };

  return (
    <InputGroupButton size="sm" onClick={onClick}>
      <input
        aria-label="Upload files"
        className="hidden"
        multiple={true}
        onChange={handleChange}
        ref={inputRef}
        title="Upload files"
        type="file"
      />
      <ImageIcon size={16} />
    </InputGroupButton>
  );
}

function PromptInputSubmit({ status }: { status: ChatStatus }) {
  const disabled = usePrompt((state) => state.persona === undefined);
  let Icon = <CornerDownLeftIcon className="size-4" />;

  if (status === "submitted") {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === "streaming") {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === "error") {
    Icon = <XIcon className="size-4" />;
  }

  return (
    <InputGroupButton
      aria-label="Submit"
      size="icon-sm"
      type="submit"
      variant={disabled ? "ghost" : "default"}
      disabled={disabled}
    >
      {Icon}
    </InputGroupButton>
  );
}

interface ChatInputProps {
  status: ChatStatus;
  handleSubmit: SubmitEventHandler<HTMLFormElement>;
}

export function ChatInput({ status, handleSubmit }: ChatInputProps) {
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  // Attach drop handlers on the nearest form and document
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        usePrompt.getState().addFiles(e.dataTransfer.files);
      }
    };
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <form className="w-full max-w-190 px-2 pb-8" onSubmit={handleSubmit}>
      <InputGroup className="overflow-hidden">
        <InputGroupAddon align="block-end" className="order-first flex-wrap gap-1">
          <ChatPersona />
          <PromptInputAttachments />
        </InputGroupAddon>
        <div className="contents">
          <PromptInputTextarea />
        </div>
        <InputGroupAddon align="block-end" className="justify-between gap-1">
          <div className="flex items-center gap-1">
            <InputGroupButton
              size="sm"
              variant={useWebSearch ? "default" : "ghost"}
              onClick={() => {
                setUseWebSearch((it) => !it);
              }}
            >
              <GlobeIcon size={16} />
              <span className="hidden sm:flex">网络搜索</span>
            </InputGroupButton>
          </div>
          <div className="flex items-center gap-1">
            <PromptInputAddFiles />
            <PromptInputSubmit status={status} />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
