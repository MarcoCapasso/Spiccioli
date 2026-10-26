import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./IconButton";

type ModalProps = {
  title: string;
  subtitle?: string;
  size?: "md" | "sm";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  //L'id del campo che riceve il cursore all'apertura; senza, il primo campo del contenuto
  initialFocusId?: string;
};

//Gli elementi che vengono focussati da TAB con tastiera
const FOCUSABLE =
  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';

//Una finestra sopra la pagina, si chiude con ESC
export function Modal({
  title,
  subtitle,
  size = "md",
  onClose,
  children,
  footer,
  icon,
  initialFocusId,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  //Elemento che aveva il focus prima dell'apertura
  const previousFocusRef = useRef(document.activeElement as HTMLElement | null);

  //La funzioe di chiusura
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  //All'apertura focus dentro la finestra, Esc e Tab gestiti.
  //Alla chiusura: tutto rimesso a posto
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    //Il campo indicato riceve il cursore a ogni esecuzione dell'effetto, anche alla seconda
    //che React fa in sviluppo: l'autoFocus parte una volta sola e verrebbe scavalcato
    const wanted = initialFocusId ? document.getElementById(initialFocusId) : null;

    if (wanted && dialog.contains(wanted)) {
      wanted.focus();
    } else if (!dialog.contains(document.activeElement)) {
      const body = dialog.querySelector(".modal-body");
      const first =
        body?.querySelector<HTMLElement>(FOCUSABLE) ??
        dialog.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab" || !dialog) {
        return;
      }

      //Il focus resta dentro la finestra quando aperta
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousFocus = previousFocusRef.current;

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [initialFocusId]);

  const classes = ["modal", size === "sm" && "modal-sm"]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className="modal-root">
      <div className="backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={icon ? "modal-head modal-head-stacked" : "modal-head"}>
          {icon}
          <div>
            <h2 className="t-h2" id={titleId}>
              {title}
            </h2>
            {subtitle && (
              <p className="t-small" style={{ margin: "4px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          {!icon && <IconButton icon="x" label="Chiudi" onClick={onClose} />}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}