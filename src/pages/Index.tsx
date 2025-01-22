import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { toast } from "sonner";
import { Scale, Shield, MessageSquare, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  text: string;
  isBot: boolean;
  audio?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const playAudio = (text: string) => {
    if (isMuted) return;
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; // Normal speaking rate
      utterance.pitch = 1.0; // Normal pitch
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio response");
    }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Provide user feedback
    toast.info(newMuteState ? "Audio responses muted" : "Audio responses unmuted");
    
    // Stop any ongoing speech when muting
    if (newMuteState && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: message, isBot: false }]);

      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const newMessage = { text: data.response, isBot: true };
      setMessages(prev => [...prev, newMessage]);
      
      // Play the audio response
      playAudio(data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/upload_image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        { text: `Uploaded image: ${file.name}`, isBot: false },
        { text: data.response, isBot: true }
      ]);

      // Play the audio response
      playAudio(data.response);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] font-inter">
      <header className="flex-none p-6 bg-[#161B22] border-b border-[#30363D]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-[#8B5CF6]" />
            <h1 className="text-2xl font-bold text-white">Department of Justice AI Assistant</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-[#C9D1D9] hover:text-white hover:bg-[#30363D]"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
              <Scale className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Welcome to the Department of Justice AI Assistant.How can I help you Today?
            </h2>
            <p className="text-[#C9D1D9] max-w-md">
              How can I help you today?
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.text}
            isBot={message.isBot}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#30363D] rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-.3s]" />
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-.5s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none max-w-5xl mx-auto w-full px-6 pb-6">
        <ChatInput
          onSendMessage={sendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;