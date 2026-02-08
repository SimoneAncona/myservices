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
import { handleDownload } from "../../lib/utils";
import { useMediaQuery } from "react-responsive";
import { NoteContext } from "./store/config";

const convertToMd = (html: string) => {
  for (let i = 1; i <= 5; i++) 
    html = html.replaceAll(`<h${i}>`, "#".repeat(i) + " ").replaceAll(`</h${i}>`, "\n\n");
  html = html
    .replaceAll("<p>", "")
    .replaceAll("</p>", "  \n")
    .replaceAll("<ul>", "")
    .replaceAll("</ul>", "\n")
    .replaceAll("<ol>", "")
    .replaceAll("</ol>", "\n")
    .replaceAll("<li>", "- ")
    .replaceAll("</li>", "")
    .replaceAll("<pre><code>", "```\n")
    .replaceAll("</code></pre>", "\n```\n")
    .replaceAll("<code>", "`")
    .replaceAll("</code>", "`")
    .replaceAll("<code>", "`")
    .replaceAll("<em>", "_")
    .replaceAll("</em>", "_")
    .replaceAll("<strong>", "**")
    .replaceAll("</strong>", "**")
    .replaceAll("<label><input><span></span></label><div>", "")
    .replaceAll("</div>", "\n")
  return html
}

export function FileEditor() {
  const context = useContext(NoteContext);
  const mainContext = useContext(ConfigContext);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const [isLocked, setIsLocked] = useState(false);
  const { isError, data } = useQuery({
    queryKey: [lockPassword, context.content?.path, "file"],
    queryFn: async () => {
      setIsLocked(false);
      return await getFile(context.content!.path, lockPassword, () => {
        if (lockPassword !== null) toast.error("Wrong password");
        setIsLocked(true);
      })
    }
  });
  const isMobile = useMediaQuery({ maxWidth: 800 });
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches && mainContext.theme === "system" || mainContext.theme === "dark";
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
      editorProps: {
        attributes: {
          class: "prose max-w-none flex-1 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none overflow-y-auto h-full" + (isDark ? " prose-invert" : "")
        }
      },
      
    });

  const saveFile = useCallback(async (path: string, content: string, key: string | null) => {
    try {
      await upsertFile(
        path,
        key,
        new Blob([content])
      );
    } catch {
      toast.error("Unable to save the file");
    }
  }, []);

  useEffect(() => {
    if (!editor) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
   
    const onUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      const path = context.content!.path;
      const content = editor.getHTML();
      const key = lockPassword;
      timeoutId = setTimeout(() => {
        saveFile(
          path,
          content,
          key
        );
      }, 700)
    };

    editor.on("update", onUpdate);
    return () => { editor.off("update", onUpdate); }
  }, [saveFile, context.content, editor, lockPassword]);

  useEffect(() => {
    if (editor && data !== undefined) {
      editor.commands.clearContent(true);
      editor.commands.setContent(data);
    }
  }, [editor, data, context.content?.path]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        const split = context.content!.path.split("/");
        split.pop()
        context.setContent({
          path: split.join("/"),
          type: "directory"
        })
      }
    }
    document.addEventListener("keydown", handleKeys, true);
    return () => { document.removeEventListener("keydown", handleKeys, true); }
  })

  if (context.content === null) return <></>;

  const size = !isMobile ? "sm" : "lg";
  const variant = !isMobile ? "outline" : "ghost"
  const tools = (
    <div className={"flex gap-2 px-2 justify-center overflow-auto" + (isMobile ? " bg-primary-foreground rounded-3xl" : "")}>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </Button>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </Button>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List />
      </Button>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().clearNodes().toggleTaskList().run()}>
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
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().setParagraph().run()}>
        <TextIcon />
      </Button>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 />
      </Button>
      <Button className="shrink" variant={variant} size={size} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 />
      </Button>
    </div>)

  if (isError) toast.error("Cannot get file");
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      {isLocked && <LockAlert setLockPassword={setLockPassword} />}
      <ItemOptions lock={lockPassword} onDownload={e => {
        let content = editor.getHTML();
        content = content.replace(/<(\w+)(\s+[^>]+?)?>/g, '<$1>');
        const filename = context.content!.path.split("/").pop()!.split(".")[0];
        if (e === "html") {
          handleDownload(filename + ".html", content)
          return
        }
        handleDownload(filename + ".md", convertToMd(content));

      }} />
      {!isMobile && tools}
      <EditorContent
        spellCheck={false}
        editor={editor}
        className="prose max-w-none flex-1 h-full overflow-auto"
        />
      {isMobile && tools}
    </div>
  )
}