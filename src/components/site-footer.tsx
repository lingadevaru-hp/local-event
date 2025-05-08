export function SiteFooter() {
  return (
    <footer className="py-8 md:px-8 md:py-10 border-t border-border/30 bg-secondary/30 glassmorphism">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-auto text-center">
        <p className="text-xs text-muted-foreground opacity-60">
          Developed by <span className="font-semibold">HackNova</span>
        </p>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Local Pulse. All rights reserved.
        </p>
        <div className="hidden md:flex space-x-4 text-sm text-primary mt-2">
          <a href="/about" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">About</a>
          <a href="/contact" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Contact Us</a>
          <a href="/privacy" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
