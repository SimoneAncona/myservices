import { useCallback, useContext, useEffect, useState } from "react";
import { ConfigContext } from "@/store/config";
import { getFile, upsertFile } from "@/api/requests";
import { toast } from "sonner";
import { LockAlert } from "@/components/ui/lock-alert";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Heading from "@tiptap/extension-heading";
import { Button } from "@/components/ui/button";
import { Bold, CheckSquare, Heading1, Heading2, Italic, List, TextIcon } from "lucide-react";
import { ItemOptions } from "@/components/ui/path";
import { Placeholder } from '@tiptap/extensions'
import { useQuery } from '@tanstack/react-query'

export function FileEditor() {
  const context = useContext(ConfigContext);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const [isLocked, setIsLocked] = useState(false);
  const { isError, data } = useQuery({
    queryKey: [lockPassword, context, "file"],
    queryFn: async () => {
      setIsLocked(false);
      return await getFile(context.mainState.content!.path, lockPassword, () => {
        if (lockPassword !== null) toast.error("Wrong password");
        setIsLocked(true);
      })
    }
  });
  const [oldData, setOldData] = useState(null as string | null);

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const editor = useEditor({
    extensions: [
        StarterKit.configure({
          heading: { 
            levels: [1, 2, 3, 4], 
          },
        }),
        Heading.configure({
          HTMLAttributes: {
            class: "text-accent"
          }
        }),
        TaskList.configure(
          {
            HTMLAttributes: {
              class: "space-y-1 list-none [&_input]:mt-1.5 [&_input]:cursor-pointer [&_li[data-checked='true']_input]:accent-(--accent)"
            }
          }
        ),
        TaskItem.configure(
          { 
            nested: true,
            HTMLAttributes: {
              class: "flex items-center space-x-3"
            }
          }
        ),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({
          placeholder: "Write something...",
          emptyEditorClass:
            'cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-2 before:left-2 before:text-mauve-11 before:opacity-50 before-pointer-events-none',
        })
      ],
      content: "",
      autofocus: "all",
      editorProps: {
        attributes: {
          class: "prose max-w-none flex-1 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none overflow-y-auto h-full" + (isDark ? " prose-invert" : "")
        }
      },
      
    });

  useEffect(() => {
      if (!editor) return;

      const content = editor.getHTML();
      if (content === oldData) return;
      if (context.mainState.content === null) return;

      upsertFile(context.mainState.content.path, lockPassword, new Blob([content]))
        .catch(() => {
          toast.error("Unable to autosave");
        });
  }, [context, editor, lockPassword, oldData]);

  useEffect(() => {
    if (editor && data) {
      editor.commands.setContent(data);
    }
  }, [editor, data, context]);
  
  const saveFile = useCallback(async () => {
      const content = editor.getHTML();
      if (content === oldData) return;
      if (context.mainState.content === null) return;
      setOldData(content);
      try {
        await upsertFile(context.mainState.content.path, lockPassword, new Blob([content]))
      } catch {
        toast.error("Unable to save the file");
      }
    }, [editor, lockPassword, oldData, context]);

  useEffect(() => {
    const intervalId = setInterval(saveFile, 10000);
    return () => clearInterval(intervalId);
  }, [saveFile]);

  if (context.mainState.content === null) return <></>;

  if (isError) toast.error("Cannot get file");
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      {isLocked && <LockAlert setLockPassword={setLockPassword} />}
      <ItemOptions lock={lockPassword} />
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().clearNodes().toggleTaskList().run()}>
          <CheckSquare />
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Table2 />
        </Button> */}
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setParagraph().run()}>
          <TextIcon />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Button>
      </div>
      <EditorContent
        spellCheck={false}
        editor={editor}
        className="prose max-w-none flex-1 h-full overflow-auto"
      />
    </div>
  )
}