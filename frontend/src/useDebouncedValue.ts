import { useEffect, useState } from 'react';

//Restituisce il valore solo dopo che è rimasto invariato per il tempo indicato
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    
    //Ogni nuovo valore annulla l'attesa del precedente
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}