import { CircleCheck, CircleX, Clock, MessageSquare, PackageCheck, RotateCcw, Send, Truck } from 'lucide-react';

const ORDER_STATUS_META = {
  NEW: { label: 'Yangi', color: 'badge-blue', icon: Send },
  AWAITING_PAYMENT: { label: "To'lov kutilmoqda", color: 'badge-amber', icon: Clock },
  CHECKING_PAYMENT: { label: "To'lov tekshirilmoqda", color: 'badge-violet', icon: Clock },
  PAID: { label: "To'landi", color: 'badge-green', icon: CircleCheck },
  PREPARING: { label: 'Tayyorlanmoqda', color: 'badge-amber', icon: Clock },
  ACCESS_GRANTED: { label: 'Kirish berildi', color: 'badge-green', icon: CircleCheck },
  SHIPPED: { label: 'Yetkazishga topshirildi', color: 'badge-violet', icon: Truck },
  DELIVERED: { label: 'Yetkazib berildi', color: 'badge-green', icon: PackageCheck },
  COMPLETED: { label: 'Yakunlandi', color: 'badge-green', icon: CircleCheck },
  CANCELLED: { label: 'Bekor qilindi', color: 'badge-red', icon: CircleX },
  REFUNDED: { label: 'Pul qaytarildi', color: 'badge-orange', icon: RotateCcw },
};

const PAYMENT_STATUS_META = {
  PENDING: { label: 'Kutilmoqda', color: 'badge-amber', icon: Clock },
  CHECKING: { label: 'Tekshirilmoqda', color: 'badge-violet', icon: Clock },
  PAID: { label: "To'landi", color: 'badge-green', icon: CircleCheck },
  FAILED: { label: 'Muvaffaqiyatsiz', color: 'badge-red', icon: CircleX },
  REFUNDED: { label: 'Qaytarildi', color: 'badge-orange', icon: RotateCcw },
};

const LEAD_STATUS_META = {
  NEW: { label: 'Yangi', color: 'badge-blue', icon: Send },
  CONTACTED: { label: "Bog'lanildi", color: 'badge-violet', icon: MessageSquare },
  CONVERTED: { label: "Xaridorga aylandi", color: 'badge-green', icon: CircleCheck },
  CLOSED: { label: 'Yopildi', color: 'badge-neutral', icon: CircleX },
  REJECTED: { label: 'Rad etildi', color: 'badge-red', icon: CircleX },
};

function Badge({ meta, fallback }) {
  const { label, color, icon: Icon } = meta || { label: fallback, color: 'badge-neutral', icon: Clock };
  return (
    <span className={`badge ${color}`}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }) {
  return <Badge meta={ORDER_STATUS_META[status]} fallback={status} />;
}

export function PaymentStatusBadge({ status }) {
  return <Badge meta={PAYMENT_STATUS_META[status]} fallback={status} />;
}

export function LeadStatusBadge({ status }) {
  return <Badge meta={LEAD_STATUS_META[status]} fallback={status} />;
}

export { ORDER_STATUS_META, PAYMENT_STATUS_META, LEAD_STATUS_META };
