import { useAuth } from "../auth/auth-context";
import { IconButton } from "./IconButton";

//Iniziali come avatar
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

//Utente collegato
export function SidebarUser() {
  const { session, signOut } = useAuth();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const email = user.email ?? "";
  const meta = user.user_metadata;

  const name =
    [meta?.full_name, meta?.name].find(
      (value): value is string => typeof value === "string" && value !== "",
    ) ?? email.split("@")[0];

  return (
    <div className="sidebar-foot" title={`${name} · ${email}`}>
      <div className="avatar" aria-hidden="true">
        {initials(name) || "–"}
      </div>
      <div className="who">
        <div className="t-h3">{name}</div>
        <div className="t-xs">{email}</div>
      </div>
      <IconButton icon="logout" label="Esci" onClick={signOut} />
    </div>
  );
}
