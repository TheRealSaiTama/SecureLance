import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
}

interface AiChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChatInterface = ({ isOpen, onClose }: AiChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      text: "👋 Hi there! I'm your SecureLance assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert previous messages to a history format for the API
      const history = messages
        .filter((msg) => msg.id !== "welcome") // Exclude the welcome message
        .map((msg) => ({
          role: msg.type,
          content: msg.text,
        }));

      // Send the message to your backend API
      const response = await axios.post(
        "http://localhost:5002/api/v1/ai/chat",
        {
          message: input,
          history: history,
        }
      );

      // Add the assistant's response to the messages
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="flex items-center text-xl">
            <Sparkles className="h-5 w-5 mr-2 text-web3-primary" />
            SecureLance AI Assistant
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-4 max-h-[50vh] mb-4 space-y-4 bg-muted/30 rounded-md">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.type === "user"
                      ? "bg-web3-primary text-white rounded-tr-none"
                      : "bg-muted rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] p-3 rounded-xl bg-muted rounded-tl-none flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            size="icon"
            className="bg-web3-primary hover:bg-web3-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiChatInterface;
