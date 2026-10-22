import { useAuth } from "./auth/auth-context";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { LoginPage } from "./pages/LoginPage";

//Il componente radice, provvisorio: le pagine vere e le rotte arrivano nella lezione 12.9
function App() {
  const { session, loading } = useAuth();

  //Non si sa ancora se esiste una sessione salvata: meglio non mostrare nulla
  if (loading) {
    return null;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (import.meta.env.DEV) {
    return <DesignSystemPage />;
  }

  return (
    <main>
      <h1 className="t-h1">Spiccioli</h1>
    </main>
  );
}

export default App;
