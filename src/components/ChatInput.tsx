import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Image as ImageIcon, Send } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, onFileUpload, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Sending message to backend:", message);
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading file to backend:", file.name);
      onFileUpload(file);
    }
  };

  const startRecording = () => {
    try {
      console.log("Starting voice recording...");
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in your browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening...");
        console.log("Speech recognition started");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice recognized, converting to text:", transcript);
        setMessage(transcript);
        // Automatically send the message when voice input is received
        console.log("Sending voice query to backend:", transcript);
        onSendMessage(transcript);
        toast.success("Voice captured and sent!");
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Could not start speech recognition");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      console.log("Stopping voice recording");
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-[#161B22] rounded-lg border border-[#30363D]">
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="text-[#C9D1D9] hover:text-white hover:bg-[#30363D]"
      >
        <ImageIcon className="w-5 h-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleMicClick}
        disabled={isLoading}
        className={`text-[#C9D1D9] hover:text-white hover:bg-[#30363D] ${
          isRecording ? "bg-[#30363D] text-white" : ""
        }`}
      >
        <Mic className="w-5 h-5" />
      </Button>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about DOJ services..."
        className="flex-1 bg-[#0D1117] border-[#30363D] text-white placeholder:text-[#C9D1D9] focus-visible:ring-[#8B5CF6]"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};