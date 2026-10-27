import { Suspense, useEffect, useRef, useState } from "react";
import { Skeleton } from "../components/States";
import { NavLink, Outlet, useLocation } from "react-router";
import { Brand } from "../components/Brand";
import { Fab } from "../components/Fab";
import { Icon, type IconName } from "../components/Icon";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTransactionActions } from "../components/transaction-actions-context";
import { TransactionActionsProvider } from "../components/TransactionActionsProvider";
import { SidebarUser } from "../components/SidebarUser";
import { TopBar } from "./TopBar";
import { useNewShortcut } from "../useNewShortcut";
import { usePageTitle } from "../usePageTitle";

type NavItem = { to: string; icon: IconName; label: string; subtitle: string };

//Le voci della barra laterale: il titolo e il sottotitolo della pagina vengono da qui
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
    to: "/piano",
    icon: "wallet",
    label: "Piano del mese",
    subtitle: "Andamento previsto contro reale",
  },
  {
    to: "/spese-ricorrenti",
    icon: "repeat",
    label: "Spese ricorrenti",
    subtitle: "Abbonamenti, affitto e rate",
  },
  {
    to: "/categorie",
    icon: "tag",
    label: "Categorie",
    subtitle: "Organizza le tue spese",
  },
  {
    to: "/impostazioni",
    icon: "settings",
    label: "Impostazioni",
    subtitle: "Il tuo account e la privacy",
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
  //Chiamata quando si sceglie una voce: sul telefono chiude il menu
  onNavigate: () => void;
};

//Un gruppo di voci: la voce della pagina corrente si evidenzia da sola
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

//Il guscio: barra laterale, barra in alto e contenuto
function AppShell() {
  const { pathname } = useLocation();
  const current = ALL_NAV.find((item) => item.to === pathname);
  const { openNew } = useTransactionActions();
  useNewShortcut(openNew);

  //Il menu a scomparsa del telefono: lo possiede il guscio, perché lo usano barra laterale, barra in alto e sfondo
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeMenu = () => setMenuOpen(false);

  //Il titolo della scheda del browser segue la pagina
  usePageTitle(current?.label);

  //Cambiando pagina si torna in cima: in questa modalità il router non lo fa da solo
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

  return (
    <div className="app">
      <aside
        ref={sidebarRef}
        id="sidebar"
        className={menuOpen ? "sidebar open" : "sidebar"}
        aria-label="Navigazione principale"
      >
        {/* Marchio a sinistra, tema a destra: stessa altezza */}
        <div className="sidebar-brand">
          <Brand />
          <ThemeToggle />
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
          onNewTransaction={openNew}
        />
        <main className="content">
          <Suspense fallback={<Skeleton height={120} radius={12} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <Fab icon="plus" label="Nuovo movimento" onClick={openNew} />
    </div>
  );
}

//La struttura dell'app, con le finestre dei movimenti a disposizione di tutte le pagine
export function AppLayout() {
  return (
    <TransactionActionsProvider>
      <AppShell />
    </TransactionActionsProvider>
  );
}
