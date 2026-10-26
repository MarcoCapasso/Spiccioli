import { useEffect } from 'react';

//True se si sta scrivendo: lì la "n" è una lettera, non una scorciatoia
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

//Premendo N parte l'azione, a meno che non si stia scrivendo o ci sia una finestra aperta
export function useNewShortcut(onTrigger: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'n') {
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) {
        return;
      }
      if (isTyping(event.target) || document.querySelector('[role="dialog"]')) {
        return;
      }

      event.preventDefault();
      onTrigger();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);
}