import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

//Chiede conferma prima di un'azione distruttiva
export function ConfirmModal({
  title,
  children,
  confirmLabel,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      size="sm"
      icon={
        <div className="warn-ico">
          <Icon name="alert" />
        </div>
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} autoFocus>
            Annulla
          </Button>
          <Button
            variant="danger"
            icon="trash"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted" style={{ margin: 0 }}>
        {children}
      </p>
    </Modal>
  );
}
