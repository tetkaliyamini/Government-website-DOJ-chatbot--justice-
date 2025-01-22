import { cn } from "@/lib/utils";
import { Scale, MessageCircle } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-none">
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-[#8B5CF6]" />
          </div>
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4",
          isBot
            ? "bg-[#8B5CF6] text-white"
            : "bg-[#30363D] text-white"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
      {!isBot && (
        <div className="flex-none">
          <div className="w-8 h-8 rounded-full bg-[#30363D] flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};