import { Card } from "../components/Card";
import { EmptyState } from "../components/States";

export function TransactionsPage() {
  return (
    <Card>
      <EmptyState
        title="Movimenti in arrivo"
        text="Qui troverai lo storico di entrate e uscite, giorno per giorno."
      />
    </Card>
  );
}
