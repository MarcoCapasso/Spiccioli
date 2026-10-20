import { DesignSystemPage } from "./pages/DesignSystemPage";

//Il componente radice: per ora mostra solo la pagina di sviluppo
function App() {
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
