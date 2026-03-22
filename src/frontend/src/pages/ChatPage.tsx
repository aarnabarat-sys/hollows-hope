import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatHistory,
  useEndChatSession,
  useSendMessage,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  MessageCircleHeart,
  RefreshCw,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type LocalMessage = { message: string; fromUser: boolean; id: string };

export function ChatPage() {
  const [input, setInput] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<LocalMessage[]>(
    [],
  );
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgCountRef = useRef(0);

  const { data: history, isLoading } = useChatHistory();
  const sendMessage = useSendMessage();
  const endSession = useEndChatSession();

  const historyMessages = (history || []).map((m, i) => ({
    ...m,
    id: `hist-${i}`,
  }));
  const allMessages = [...historyMessages, ...optimisticMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsgId = `opt-${msgCountRef.current++}`;
    setInput("");
    setOptimisticMessages((prev) => [
      ...prev,
      { message: text, fromUser: true, id: userMsgId },
    ]);
    setIsTyping(true);

    try {
      const response = await sendMessage.mutateAsync(text);
      const aiMsgId = `opt-${msgCountRef.current++}`;
      setOptimisticMessages((prev) => [
        ...prev,
        { message: response, fromUser: false, id: aiMsgId },
      ]);
    } catch {
      toast.error("Couldn't reach your companion right now.");
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== userMsgId));
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession.mutateAsync();
      setOptimisticMessages([]);
      toast.success("Session ended. Take care! 🌿");
    } catch {
      toast.error("Failed to end session.");
    }
  };

  return (
    <main
      className="container mx-auto px-4 py-6 max-w-2xl flex flex-col"
      style={{ height: "calc(100vh - 4rem - 60px)" }}
      data-ocid="chat.page"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircleHeart className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Your Companion
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndSession}
          disabled={endSession.isPending}
          className="rounded-full text-xs"
          data-ocid="chat.secondary_button"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> New Session
        </Button>
      </div>

      <Alert
        className="mb-4 border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/30"
        data-ocid="chat.panel"
      >
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Important:</strong> Your Companion is a supportive{" "}
          <em>friend</em>, not a therapist or medical professional. For
          professional mental health support, please reach out to a qualified
          mental health professional or crisis line.
        </AlertDescription>
      </Alert>

      <Card className="flex-1 overflow-hidden border-border shadow-card">
        <CardContent className="h-full p-0">
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3" data-ocid="chat.loading_state">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`flex ${n % 2 === 0 ? "justify-end" : ""}`}
                  >
                    <Skeleton
                      className={`h-12 ${n % 2 === 0 ? "w-48" : "w-64"} rounded-2xl`}
                    />
                  </div>
                ))}
              </div>
            ) : allMessages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center py-8"
                data-ocid="chat.empty_state"
              >
                <span className="text-5xl mb-3">💬</span>
                <p className="font-medium text-foreground mb-1">
                  Start a conversation
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your companion is here to listen, support, and chat. Share how
                  you're feeling.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {allMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.fromUser ? "justify-end" : "justify-start"}`}
                    data-ocid={`chat.item.${i + 1}`}
                  >
                    {!msg.fromUser && (
                      <span className="text-xl mr-2 mt-auto mb-1">🤖</span>
                    )}
                    <div
                      className={
                        msg.fromUser ? "chat-bubble-user" : "chat-bubble-ai"
                      }
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-end gap-2"
                data-ocid="chat.loading_state"
              >
                <span className="text-xl">🤖</span>
                <div className="chat-bubble-ai flex gap-1 items-center px-4 py-3">
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
                    style={{ animationDelay: "200ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
                    style={{ animationDelay: "400ms" }}
                  />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Share what's on your mind..."
          className="flex-1 rounded-full"
          disabled={sendMessage.isPending || isTyping}
          data-ocid="chat.input"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending || isTyping}
          className="rounded-full bg-primary text-primary-foreground w-12 h-10 p-0"
          data-ocid="chat.submit_button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
