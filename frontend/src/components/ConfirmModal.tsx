import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  icon?: IconName;
};

//Chiede conferma prima di un'azione distruttiva
export function ConfirmModal({
  title,
  children,
  confirmLabel,
  loading = false,
  onConfirm,
  onClose,
  icon = 'trash',
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
          <Button variant="secondary" onClick={onClose} autoFocus>Annulla</Button>
          <Button
            variant="danger"
            icon={icon}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted confirm-text">{children}</p>
    </Modal>
  );
}
