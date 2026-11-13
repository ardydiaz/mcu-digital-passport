import { CircleHelp } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * <ConfirmDialog open={open} title="Cancel registration?" message="..." onConfirm={...} onCancel={...} />
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon = CircleHelp,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      icon={icon}
      className="max-w-md"
      footer={
        <>
          <Button variant="soft" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="royal" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </Modal>
  );
}
