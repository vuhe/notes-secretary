import { CheckIcon, DramaIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import { InputGroupButton } from "@/components/shadcn/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { useConfig } from "@/hooks/use-config";
import { usePrompt } from "@/hooks/use-prompt";
import { cn } from "@/lib/utils";

const PersonaName = ({ className, ...props }: ComponentProps<"span">) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);

export function ChatPersona() {
  const personas = useConfig((state) => state.personas);
  const selected = usePrompt((state) => state.persona);
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={(props) => (
          <InputGroupButton size="sm" {...props}>
            <DramaIcon size={16} />
            <span className={cn(selected === undefined && "text-muted-foreground")}>
              {selected?.id ?? "请选择 Persona"}
            </span>
          </InputGroupButton>
        )}
      />
      <PopoverContent className="w-45 p-0 **:data-[slot=dialog-close]:top-3">
        <Command className="**:data-[slot=command-input-wrapper]:h-auto">
          <CommandInput placeholder="搜索 Persona..." />
          <CommandList>
            <CommandEmpty>未找到 Persona</CommandEmpty>
            {personas.map((m) => (
              <CommandItem
                key={m.id}
                onSelect={() => {
                  usePrompt.getState().selectPersona(m);
                  setOpen(false);
                }}
                value={m.id}
              >
                <DramaIcon size={12} />
                <PersonaName>{m.id}</PersonaName>
                {selected?.id === m.id ? (
                  <CheckIcon className="ml-auto size-4" />
                ) : (
                  <div className="ml-auto size-4" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
