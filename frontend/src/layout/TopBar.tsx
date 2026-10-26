import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { useScrolled } from "./useScrolled";

type TopBarProps = {
  title: string;
  subtitle: string;
  menuOpen: boolean;
  onMenuClick: () => void;
  onNewTransaction: () => void;
};

//La barra in alto
export function TopBar({
  title,
  subtitle,
  menuOpen,
  onMenuClick,
  onNewTransaction,
}: TopBarProps) {
  const scrolled = useScrolled();

  return (
    <header className={scrolled ? "topbar scrolled" : "topbar"}>
      <IconButton
        className="burger"
        icon="menu"
        label="Apri menu"
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        onClick={onMenuClick}
      />
      <div className="topbar-title">
        <h1 className="t-h1">{title}</h1>
        <div className="t-small">{subtitle}</div>
      </div>
      <Button
        icon="plus"
        className="quick-add"
        title="Nuovo movimento (N)"
        onClick={onNewTransaction}
      >
        Nuovo movimento{" "}
        <span className="kbd" aria-hidden="true">
          N
        </span>
      </Button>
    </header>
  );
}