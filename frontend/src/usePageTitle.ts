import { useEffect } from 'react';

const APP_NAME = 'Spiccioli';
const BASE_TITLE = 'Spiccioli - Expense Tracker';

export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${APP_NAME}` : BASE_TITLE;
  }, [page]);
}