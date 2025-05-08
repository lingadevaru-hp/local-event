
export function SiteFooter() {
  return (
    <footer className="py-8 md:px-8 md:py-6 border-t bg-secondary/50"> {/* Updated background */}
      <div className="container flex flex-col items-center justify-center gap-4 md:h-auto text-center">
        <p className="text-xs text-muted-foreground opacity-50">
          Developed by HackNova
        </p>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Local Pulse. All rights reserved.
        </p>
        {/* Optional: Links for desktop view, can be added here if needed */}
        {/* <div className="hidden md:flex space-x-4 text-sm text-primary">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div> */}
      </div>
    </footer>
  );
}
