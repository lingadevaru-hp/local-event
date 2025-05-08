import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <SignIn path="/sign-in" />
    </div>
  );
}
