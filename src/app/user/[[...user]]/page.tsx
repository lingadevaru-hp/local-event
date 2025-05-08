
import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="flex justify-center items-center min-h-screen py-8">
    <UserProfile path="/user" routing="path" />
  </div>
);

export default UserProfilePage;
