import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareMoreIcon } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/use-config";
import { useNavigation } from "@/hooks/use-navigation";
import { ChatMetadataSchema } from "@/types/chat-metadata";

function AnimateDiv(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
}

export function ChatTitle() {
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(2);

  const id = useNavigation((state) => state.id);
  const title = useConfig((state) => state.chats.find((chat) => chat.id === id)?.title);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatMetadataSchema),
  });

  useEffect(() => {
    reset({ id, title: title ?? "" });
  }, [id, title, reset]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) return;
    setDeleteConfirm(2);
    reset();
  };

  const onSubmit = handleSubmit((_data) => {
    setOpen(false);
    setDeleteConfirm(2);
    // TODO: 发送到后端进行保存，并通知刷新对话列表
  });

  const handleDelete = () => {
    if (deleteConfirm > 0) {
      setDeleteConfirm(deleteConfirm - 1);
      return;
    }
    setOpen(false);
    setDeleteConfirm(2);
    // TODO: 删除后跳转到新对话
  };

  const titleId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-lg" disabled={title === undefined}>
          <MessageSquareMoreIcon size={16} />
          <span className="hidden @[760px]/header:block">{title ?? "新对话"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-110 max-h-full">
        <DialogHeader>
          <DialogTitle>对话信息</DialogTitle>
          <DialogDescription>在此编辑对话相关内容或者删除对话</DialogDescription>
        </DialogHeader>
        <FieldSet>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={titleId}>标题</FieldLabel>
                  <Input
                    {...field}
                    id={titleId}
                    aria-invalid={fieldState.invalid}
                    placeholder="请输入标题……"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <DialogFooter className="select-none">
          <AnimatePresence mode="wait">
            {deleteConfirm === 2 ? (
              <AnimateDiv
                key="delete-2"
                className="w-full flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <Button variant="destructive" className="mr-auto" onClick={handleDelete}>
                  删除
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <Button onClick={onSubmit}>保存</Button>
              </AnimateDiv>
            ) : deleteConfirm === 1 ? (
              <AnimateDiv key="delete-1" className="m-auto">
                <span className="mr-2">二次确认</span>
                <Button variant="destructive" onClick={handleDelete}>
                  删除
                </Button>
                <span className="ml-2">后不可恢复</span>
              </AnimateDiv>
            ) : (
              <AnimateDiv key="delete-0" className="gap-1">
                <span className="mr-2">最终确认，执行</span>
                <Button variant="destructive" onClick={handleDelete}>
                  删除
                </Button>
              </AnimateDiv>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
