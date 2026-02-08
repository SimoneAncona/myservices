import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react"
import { createPortal } from 'react-dom';
import { SendHorizonal, Sparkles, XIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Kbd, KbdGroup } from "./kbd";
import { askAi, askAiFile } from "@/api/requests";
import { ConfigContext } from "@/store/config";
import Markdown from "react-markdown";
import { useMediaQuery } from "react-responsive";
import { Button } from "./button";

type AiMessage = {
    type: "assistant" | "user"
    content: string
}

export function AiCard() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [data, setData] = useState([] as AiMessage[]);
    const scrollRef = useRef(null as HTMLDivElement | null);
    const context = useContext(ConfigContext);
    const isMobile = useMediaQuery({ maxWidth: 800 });

     const onSend = async () => {
        const updatedData = [...data, {type: "user", content: input}] satisfies AiMessage[]
        setData(updatedData);
        setInput("");
        let content = "";
        const onUpdate = (t: string) => {
            content = content + t
            setData([...updatedData, {type: "assistant", content: content}])
        };
        if (context.mainState.content?.type) {
            await askAiFile(input, context.mainState.content!.path, null, onUpdate);
            return;
        }
        await askAi(input, onUpdate)
    }

    useEffect(() => {
        const handleOpen = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "i") {
                e.preventDefault();
                setOpen(!open);
            }
            if (e.key === "Enter" && open && input) {
                e.preventDefault();
                onSend();
            }
        }
        document.addEventListener("keydown", handleOpen, true);
        return () => { document.removeEventListener("keydown", handleOpen, true); }
    })

    useEffect(() => {
        if (scrollRef.current === null) return;
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [data]);

   

    return createPortal(
        <>
            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{
                            backdropFilter: "blur(0px)"
                        }}
                        animate={{
                            backdropFilter: "blur(5px)"
                        }}
                        exit={{
                            backdropFilter: "blur(0px)"
                        }}
                        className="fixed w-screen h-dvh bg-black/50 z-20 left-0 top-0"
                        onClick={() => setOpen(false)}
                    >
                    </motion.div>
                ) : null
                }
            </AnimatePresence>
            <motion.div
                layout
                initial={false}
                animate={open ? "open" : "closed"}
                variants={{
                open: {
                    maxWidth: "600px",
                    width: "100%",
                    height: "100px",
                    borderRadius: "30px",
                    bottom: "40px",
                    right: "50%",
                    position: "fixed",
                    x: "50%"
                },
                closed: {
                    width: "60px",
                    maxWidth: "60px",
                    height: "60px",
                    borderRadius: "30px",
                    bottom: isMobile ? "55px" : "40px",
                    right: "5%",
                    position: "fixed",
                }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-primary-foreground z-30 shadow-[0px_0px_20px_color-mix(in_srgb,var(--accent),transparent_50%)] pointer-events-auto flex flex-col overflow-hidden cursor-pointer"
            >
                {
                    open ? (
                        <div className="flex items-center h-full p-5 space-x-1">
                            <textarea value={input} onChange={e => { setInput(e.target.value) }} className="focus:outline-none flex-1 resize-none" placeholder={
                                context.mainState.content?.type === "file" ? "Ask me anything about this note" : 
                                context.mainState.content?.type === "directory" ? "Ask me to search something in this folder" : "Ask ai"}></textarea>
                            <div className="bg-primary p-2 rounded-full flex items-center">
                                <SendHorizonal onClick={onSend} color="var(--primary-foreground)" />
                            </div>
                        </div>
                    ) : 
                    <Tooltip delayDuration={700}>
                        <TooltipTrigger asChild>
                            <div onClick={() => setOpen(!open)} className="flex items-center justify-center h-full">
                                <Sparkles color="var(--accent)" fill="var(--accent)" strokeWidth={1} size={30} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <KbdGroup>
                                <Kbd>CTRL</Kbd>
                                <span>+</span>
                                <Kbd>I</Kbd>
                            </KbdGroup>
                        </TooltipContent>
                    </Tooltip>
                    
                }
            </motion.div>
            {open && <div className="fixed max-w-260 w-full inset-x-0 mx-auto top-0 z-30 flex flex-col p-10 h-[calc(100%-160px)] space-y-2 overflow-y-auto">
                {data.map(e => {
                    let className = "whitespace-pre-wrap shrink-0 max-w-170 p-2 px-5 rounded-[30px] min-h-10" + (e.type === "user" ? " ml-auto bg-primary text-primary-foreground" : " mr-auto bg-primary-foreground")
                    let content = e.content;
                    const split = e.content.replaceAll("\n", " ").split(" ");
                    console.log(split)
                    const useDiv = e.type === "assistant" && split.length > 1;
                    if (e.type === "assistant" && split[0] === "<think>" && !split.includes("</think>")) {
                        content = "Thinking...";
                        className += " text-primary/50";
                    }
                    if (e.type === "assistant") {
                        content = content.replaceAll(/<think>(.|\n)*<\/think>/gm, "");
                    }
                    content = content.trim();
                    if (useDiv)
                        return <div className={className}><Markdown>{content}</Markdown></div>
                    return <motion.div initial={{ scale: 0 }} animate={{ scale: 1}} layout className={className}><Markdown>{content}</Markdown></motion.div>
                })}
                <div ref={scrollRef}></div>
            </div>}
            {isMobile && open && <div className="fixed z-50 top-3 right-3">
                <Button onClick={() => setOpen(false)} variant="outline">
                    <XIcon />
                </Button>
            </div>}
        </>
    , document.body)
}