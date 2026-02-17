import { TopBar } from "@/components/TopBar";
import { ChatInterface } from "@/components/ChatWidget";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="flex h-[100dvh] text-foreground bg-background relative overflow-hidden">
        <div className="flex flex-col flex-1 z-10 min-h-0">
          <TopBar />
          <main className="flex-1 flex flex-col overflow-hidden min-h-0">
            <ChatInterface />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
