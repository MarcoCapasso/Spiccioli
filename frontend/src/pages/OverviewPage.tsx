import { Card } from "../components/Card";
import { EmptyState } from "../components/States";

export function OverviewPage() {
  return (
    <Card>
      <EmptyState title="Panoramica in arrivo" text="Qui vedrai saldo" />
    </Card>
  );
}
