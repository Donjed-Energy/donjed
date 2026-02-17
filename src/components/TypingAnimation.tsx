export function TypingAnimation() {
  return (
    <div className="flex items-center space-x-1 py-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/80 [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/80 [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/80"></div>
    </div>
  );
}
