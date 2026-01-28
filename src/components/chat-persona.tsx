import { CheckIcon, DramaIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <DramaIcon size={16} />
          <span className={cn("font-medium", selected === undefined && "text-muted-foreground")}>
            {selected?.id ?? "请选择 Persona"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 **:data-[slot=dialog-close]:top-3">
        <DialogTitle className="sr-only">Persona Selector</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}
