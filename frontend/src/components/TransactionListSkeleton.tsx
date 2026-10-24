import { Skeleton } from './States';

//Le forme dell'elenco mentre i movimenti arrivano
export function TransactionListSkeleton() {
  return (
    <div role="status" aria-label="Caricamento dei movimenti">
      <ul className="tx-list" aria-hidden="true">
        {[55, 48, 42, 36, 30].map((width) => (
          <li className="tx" key={width}>
            <Skeleton width={40} height={40} radius={12} />
            <div>
              <Skeleton width={`${width}%`} />
              <div style={{ marginTop: 8 }}>
                <Skeleton width="30%" height={10} />
              </div>
            </div>
            <Skeleton width={72} height={16} />
          </li>
        ))}
      </ul>
    </div>
  );
}