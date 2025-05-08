import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const UserProfilePage = () => (
  <div className="flex flex-col justify-center items-center min-h-screen py-8 bg-gradient-to-br from-secondary via-background to-secondary/70">
     <div className="absolute top-6 left-6">
        <Button variant="outline" asChild className="rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card/80 glassmorphism">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    <UserProfile 
      path="/user" 
      routing="path"
      appearance={{
         elements: {
            rootBox: "shadow-2xl rounded-2xl",
            card: "bg-card/80 glassmorphism border-border/30 backdrop-blur-lg rounded-2xl",
            navbar: "hidden", // Example to hide default navbar if using custom
            navbarMobileMenuButton: "text-primary",
            headerTitle: "text-foreground",
            profileSectionTitleText: "text-primary font-semibold",
            formFieldLabel: "text-muted-foreground",
            formFieldInput: "bg-input/50 border-border/50 rounded-lg focus:border-primary focus:ring-primary/50",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2.5 text-base transition-transform hover:scale-105 active:scale-95 shadow-md",
            accordionTriggerButton: "hover:bg-muted/30",
         }
      }}
    />
  </div>
);

export default UserProfilePage;
