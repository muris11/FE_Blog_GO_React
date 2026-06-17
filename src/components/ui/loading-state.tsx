export default function LoadingState({ message = "Fetching data..." }: { message?: string }) {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-6">
        {/* Brutalist Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-black opacity-20"></div>
          <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin"></div>
        </div>
        
        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="font-serif font-black text-xl uppercase tracking-tighter animate-pulse">
            {message}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Please wait while the presses are running
          </p>
        </div>
      </div>
    </div>
  );
}
