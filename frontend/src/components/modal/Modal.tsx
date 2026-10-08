import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
      onClick={onClose}
    >
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 text-eco-dark shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="modal-title"
            className="text-xl font-semibold"
          >
            {title}
          </h2>

          <button
            type="button"
            aria-label="Cerrar"
            className="text-2xl leading-none text-eco-olive hover:text-eco-dark"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="mt-4">
          {children}
        </div>
      </section>
    </div>
  );
}

// <Modal
//   isOpen={isHowItWorksOpen}
//   onClose={() => setIsHowItWorksOpen(false)}
//   title="Cómo funciona"
// >
//   <p>Próximamente.</p>
// </Modal>