import { Navigate, Outlet } from "react-router";
import { errorMessage } from "../api/client";
import { useProfile } from "../api/queries";
import { ErrorState, Skeleton } from "../components/States";

type OnboardingGateProps = {
  completed: boolean;
};

//Passa solo chi ha lo stato dell'onboarding richiesto
export function OnboardingGate({ completed }: OnboardingGateProps) {
  const profile = useProfile();

  if (profile.isPending) {
    return (
      <main className="onboarding">
        <div className="onboarding-card">
          <div className="stack" style={{ gap: 12 }}>
            <Skeleton width={220} height={32} />
            <Skeleton width="70%" />
          </div>
        </div>
      </main>
    );
  }

  if (profile.isError) {
    return (
      <main className="onboarding">
        <ErrorState
          text={errorMessage(profile.error)}
          onRetry={() => profile.refetch()}
        />
      </main>
    );
  }

  if (profile.data.hasCompletedOnboarding !== completed) {
    return <Navigate to={completed ? "/benvenuto" : "/"} replace />;
  }

  return <Outlet />;
}
