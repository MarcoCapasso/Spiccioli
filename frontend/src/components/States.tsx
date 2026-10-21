import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Illustration, type IllustrationName } from "./Illustration";

type EmptyStateProps = {
  illustration?: IllustrationName;
  title: string;
  text: string;
  actions?: ReactNode;
};

//Nessun dato da mostrare
export function EmptyState({
  illustration = "transactions",
  title,
  text,
  actions,
}: EmptyStateProps) {
  return (
    <div className="empty">
      <Illustration name={illustration} />
      <h3 className="t-h2">{title}</h3>
      <p>{text}</p>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  text?: string;
  onRetry: () => void;
};

//Qualcosa è andato storto
export function ErrorState({
  title = "Qualcosa è andato storto",
  text = "Non è stato possibile caricare i dati. Controlla la connessione e riprova.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="empty" role="alert">
      <div className="err-ico">
        <Icon name="alert" />
      </div>
      <h3 className="t-h2">{title}</h3>
      <p>{text}</p>
      <div className="row">
        <Button icon="refresh" onClick={onRetry}>
          Riprova
        </Button>
      </div>
    </div>
  );
}

type SkeletonProps = {
  width?: number | string;
  height?: number;
  radius?: number;
};

//Una forma che scintilla al posto del contenuto in arrivo
export function Skeleton({
  width = "100%",
  height = 12,
  radius = 8,
}: SkeletonProps) {
  return (
    <div
      className="sk"
      aria-hidden="true"
      style={{ width, height, borderRadius: radius }}
    />
  );
}
