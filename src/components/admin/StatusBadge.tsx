import type { OrderStatus, PaymentStatus } from "@/types";

const ORDER: Record<OrderStatus, string> = {
  Pending: "badge-warning", Processing: "badge-info", Completed: "badge-success", Cancelled: "badge-error",
};
const PAYMENT: Record<PaymentStatus, { cls: string; label: string }> = {
  unpaid: { cls: "badge-ghost", label: "Unpaid" },
  pending_verification: { cls: "badge-warning", label: "Verify payment" },
  paid: { cls: "badge-success", label: "Paid" },
  rejected: { cls: "badge-error", label: "Rejected" },
};

export const OrderBadge = ({ status }: { status: OrderStatus }) => <span className={`badge badge-soft badge-sm ${ORDER[status]}`}>{status}</span>;
export const PaymentBadge = ({ status }: { status: PaymentStatus }) => <span className={`badge badge-soft badge-sm ${PAYMENT[status].cls}`}>{PAYMENT[status].label}</span>;
