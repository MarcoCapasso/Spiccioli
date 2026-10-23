import { Card } from "../components/Card";
import { EmptyState } from "../components/States";

//Provvisoria: le Categorie arrivano nella lezione 12.15
export function CategoriesPage() {
  return (
    <Card>
      <EmptyState
        illustration="categories"
        title="Categorie in arrivo"
        text="Qui organizzerai le tue spese."
      />
    </Card>
  );
}
