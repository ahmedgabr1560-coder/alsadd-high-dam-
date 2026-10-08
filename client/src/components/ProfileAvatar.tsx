import { UserCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProfileAvatar() {
  const { user } = useAuth();
  return <a className="profile-avatar-link" href="/profile" aria-label="فتح الملف الشخصي" title={user?.name || "الملف الشخصي"}>
    {user?.profileImage ? <img src={user.profileImage} alt="صورة الملف الشخصي" /> : <UserCircle size={23} />}
  </a>;
}
