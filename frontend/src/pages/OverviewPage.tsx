import { errorMessage } from "../api/client";
import { useProfile } from "../api/queries";
import { Card } from "../components/Card";
import { ErrorState, Skeleton } from "../components/States";

//Provvisoria: la Panoramica vera arriva nella lezione 12.16
export function OverviewPage() {
  const profile = useProfile();

  //Nessun dato
  if (profile.isPending) {
    return (
      <Card padded>
        <div className="stack" style={{ gap: 12 }}>
          <Skeleton width={140} />
          <Skeleton height={40} radius={12} />
        </div>
      </Card>
    );
  }

  //Errore: messaggio comprensibile e possibilità di riprovare
  if (profile.isError) {
    return (
      <Card>
        <ErrorState
          text={errorMessage(profile.error)}
          onRetry={() => profile.refetch()}
        />
      </Card>
    );
  }

  return (
    <Card padded>
      <p>Ciao, {profile.data.firstName}</p>
    </Card>
  );
}
