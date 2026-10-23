import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Brand } from "../components/Brand";
import { Fab } from "../components/Fab";
import { Icon, type IconName } from "../components/Icon";
import { useToast } from "../components/toast-context";
import { SidebarUser } from "../components/SidebarUser";
import { TopBar } from "./TopBar";

type NavItem = { to: string; icon: IconName; label: string; subtitle: string };

//Le voci della barra laterale
const MAIN_NAV: NavItem[] = [
  {
    to: "/",
    icon: "home",
    label: "Panoramica",
    subtitle: "Come stanno andando i tuoi conti",
  },
  {
    to: "/movimenti",
    icon: "list",
    label: "Movimenti",
    subtitle: "Tutte le entrate e le uscite",
  },
  {
    to: "/categorie",
    icon: "tag",
    label: "Categorie",
    subtitle: "Organizza le tue spese",
  },
];

//Solo in sviluppo
const DEV_NAV: NavItem[] = [
  {
    to: "/sviluppo",
    icon: "grid",
    label: "Sistema di design",
    subtitle: "Componenti e stati riutilizzabili",
  },
];

const ALL_NAV = [...MAIN_NAV, ...DEV_NAV];

type NavGroupProps = {
  items: NavItem[];
  onNavigate: () => void;
};

//la voce della pagina corrente si evidenzia da sola
function NavGroup({ items, onNavigate }: NavGroupProps) {
  return (
    <nav className="nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className="nav-item"
          title={item.label}
          onClick={onNavigate}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

//barra laterale, barra in alto e contenuto
export function AppLayout() {
  const { pathname } = useLocation();
  const current = ALL_NAV.find((item) => item.to === pathname);
  const showToast = useToast();

  //Il menu a scomparsa del telefono
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeMenu = () => setMenuOpen(false);

  //Il titolo della scheda del browser segue la pagina
  useEffect(() => {
    document.title = current ? `${current.label} · Spiccioli` : "Spiccioli";
  }, [current]);

  //Cambiando pagina si torna in cima
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  //Con il menu aperto il focus va sulla prima voce, e Esc lo chiude
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    sidebarRef.current?.querySelector<HTMLElement>("a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  //Provvisorio: la finestra del movimento arriva nella lezione 12.14
  function handleNewTransaction() {
    showToast({
      kind: "info",
      title: "In arrivo",
      message: "La finestra del movimento arriva nella lezione 12.14.",
    });
  }

  return (
    <div className="app">
      <aside
        ref={sidebarRef}
        id="sidebar"
        className={menuOpen ? "sidebar open" : "sidebar"}
        aria-label="Navigazione principale"
      >
        <div className="sidebar-brand">
          <Brand />
        </div>
        <NavGroup items={MAIN_NAV} onNavigate={closeMenu} />
        {import.meta.env.DEV && (
          <>
            <div className="nav-sep" />
            <NavGroup items={DEV_NAV} onNavigate={closeMenu} />
          </>
        )}
        <SidebarUser />
      </aside>
      <div
        className={menuOpen ? "drawer-backdrop show" : "drawer-backdrop"}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="main">
        <TopBar
          title={current?.label ?? "Spiccioli"}
          subtitle={current?.subtitle ?? ""}
          menuOpen={menuOpen}
          onMenuClick={() => setMenuOpen(true)}
          onNewTransaction={handleNewTransaction}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>

      <Fab icon="plus" label="Nuovo movimento" onClick={handleNewTransaction} />
    </div>
  );
}
