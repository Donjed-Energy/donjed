import { TopBar } from "@/components/TopBar";
import { ChatInterface } from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="flex h-screen text-foreground bg-background relative overflow-hidden">
      <div className="flex flex-col flex-1 z-10">
        <TopBar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}
