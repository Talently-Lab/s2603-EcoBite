import Modal from "../modal/Modal";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/CheckIcon";
import { Link } from "react-router-dom";

interface CheckoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder: () => void;
}

export function CheckoutConfirmationModal({
  isOpen,
  onClose,
  onViewOrder,
}: CheckoutConfirmationModalProps) {
  //onViewOrder: () => navigate("/carrito"); va a confirmar el pedido
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pedido confirmado">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-eco-light text-eco-dark">
          <CheckIcon />
        </span>
        <p className="m-0 text-sm text-eco-text-secondary">
          Tu pedido se confirmó correctamente.
        </p>
        <Button
          type="button"
          className="block w-full cursor-pointer text-center shadow-sm transition-colors hover:brightness-110"
          onClick={onViewOrder}
        >
          Ver mi pedido
        </Button>
        <Link
          to="/restaurantes"
          className="text-center text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
        >
          Seguir explorando
        </Link>
      </div>
    </Modal>
  );
}
