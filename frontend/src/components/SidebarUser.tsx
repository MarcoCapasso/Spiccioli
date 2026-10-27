import { useAuth } from "../auth/auth-context";
import { useAccountInfo } from "../auth/useAccountInfo";
import { Avatar } from "./Avatar";
import { IconButton } from "./IconButton";

//Utente collegato
export function SidebarUser() {
  const { signOut } = useAuth();
  const account = useAccountInfo();

  if (!account) {
    return null;
  }

  const { name, email, avatarUrl } = account;

  return (
    <div className="sidebar-foot" title={`${name} · ${email}`}>
      <Avatar name={name} imageUrl={avatarUrl} />
      <div className="who">
        <div className="t-h3">{name}</div>
        <div className="t-xs">{email}</div>
      </div>
      <IconButton icon="logout" label="Esci" onClick={signOut} />
    </div>
  );
}