import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "./ctx/config";
import { getFile, upsertFile } from "./api/requests";
import { toast } from "sonner";
import { LockAlert } from "./components/ui/lock-alert";

import { TooltipProvider } from "./components/ui/tooltip"
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
import { Bold, Check, CheckSquare, Heading1, Heading2, Italic, List, Table2, TextIcon } from "lucide-react";
import { ItemOptions } from "./components/ui/path";
import type { ShowObject } from "./App";
import { Placeholder } from '@tiptap/extensions'


type Prop = {
  path: string,
  isLocked: boolean,
  setContent: (x: ShowObject) => void
}

export function FileEditor({ path, isLocked, setContent }: Prop) {
  const [data, setData] = useState(null as string | null);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const [error, setError] = useState(false);
  const [oldData, setOldData] = useState(null as string | null);
  const context = useContext(ConfigContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(await getFile(path, lockPassword));
      } catch {
        setError(true);
      }
    }
    fetchData();
  }, [path, lockPassword]);

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
        TaskList,
        TaskItem.configure({ nested: true }),
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
          class: "prose max-w-none flex-1 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none overflow-y-auto h-full" + (context.theme === "dark" ? " prose-invert" : "")
        }
      },
      
    });

  useEffect(() => {
    return () => {
      if (!editor) return;

      const content = editor.getHTML();
      if (content === oldData) return;

      upsertFile(path, lockPassword, new Blob([content]))
        .catch(() => {
          toast.error("Unable to autosave before switching file");
        });
    };
  }, [path, editor, lockPassword, oldData]);


  useEffect(() => {
    if (editor && data !== null) {
      editor.commands.setContent(data);
    }
  }, [editor, data]);
  const saveFile = useCallback(async () => {
      const content = editor.getHTML();
      if (content === oldData) return;
      setOldData(content);
      try {
        await upsertFile(path, lockPassword, new Blob([content]))
      } catch {
        toast.error("Unable to save the file");
      }
    }, [editor, lockPassword, oldData, path]);

  useEffect(() => {
    
    const intervalId = setInterval(saveFile, 10000);

    return () => clearInterval(intervalId);
  }, [saveFile]);

  if (error) toast.error("Cannot get file");
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      {isLocked ? <LockAlert type="file" setLockPassword={setLockPassword}/> : <></>}
      <ItemOptions path={path} setContent={setContent} type="file" />
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
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()}>
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
        editor={editor}
        className="prose max-w-none flex-1 h-full overflow-auto"
      />
    </div>
  )
}