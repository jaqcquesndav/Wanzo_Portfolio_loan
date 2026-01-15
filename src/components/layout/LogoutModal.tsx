import { ConfirmModal } from '../ui/ConfirmModal';

interface LogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="Déconnexion"
      message="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte."
      confirmLabel="Se déconnecter"
      cancelLabel="Annuler"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
