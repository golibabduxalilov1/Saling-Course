import { CircleCheck, CircleX, Clock, MessageSquare, PackageCheck, RotateCcw, Send, Truck } from 'lucide-react';

const ORDER_STATUS_META = {
  NEW: { label: 'Yangi', tone: 'tag-info', icon: Send },
  AWAITING_PAYMENT: { label: "To'lov kutilmoqda", tone: 'tag-caution', icon: Clock },
  CHECKING_PAYMENT: { label: "To'lov tekshirilmoqda", tone: 'tag-accent', icon: Clock },
  PAID: { label: "To'landi", tone: 'tag-positive', icon: CircleCheck },
  PREPARING: { label: 'Tayyorlanmoqda', tone: 'tag-caution', icon: Clock },
  ACCESS_GRANTED: { label: 'Kirish berildi', tone: 'tag-positive', icon: CircleCheck },
  SHIPPED: { label: 'Yetkazishga topshirildi', tone: 'tag-accent', icon: Truck },
  DELIVERED: { label: 'Yetkazib berildi', tone: 'tag-positive', icon: PackageCheck },
  COMPLETED: { label: 'Yakunlandi', tone: 'tag-positive', icon: CircleCheck },
  CANCELLED: { label: 'Bekor qilindi', tone: 'tag-critical', icon: CircleX },
  REFUNDED: { label: 'Pul qaytarildi', tone: 'tag-caution', icon: RotateCcw },
};

const PAYMENT_STATUS_META = {
  PENDING: { label: 'Kutilmoqda', tone: 'tag-caution', icon: Clock },
  CHECKING: { label: 'Tekshirilmoqda', tone: 'tag-accent', icon: Clock },
  PAID: { label: "To'landi", tone: 'tag-positive', icon: CircleCheck },
  FAILED: { label: 'Muvaffaqiyatsiz', tone: 'tag-critical', icon: CircleX },
  REFUNDED: { label: 'Qaytarildi', tone: 'tag-caution', icon: RotateCcw },
};

const LEAD_STATUS_META = {
  NEW: { label: 'Yangi', tone: 'tag-info', icon: Send },
  CONTACTED: { label: "Bog'lanildi", tone: 'tag-accent', icon: MessageSquare },
  CONVERTED: { label: 'Xaridorga aylandi', tone: 'tag-positive', icon: CircleCheck },
  CLOSED: { label: 'Yopildi', tone: 'tag-neutral', icon: CircleX },
  REJECTED: { label: 'Rad etildi', tone: 'tag-critical', icon: CircleX },
};

function Tag({ meta, fallback }) {
  const { label, tone, icon: Icon } = meta || { label: fallback, tone: 'tag-neutral', icon: Clock };
  return (
    <span className={`tag ${tone}`}>
      <Icon size={11} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }) {
  return <Tag meta={ORDER_STATUS_META[status]} fallback={status} />;
}

export function PaymentStatusBadge({ status }) {
  return <Tag meta={PAYMENT_STATUS_META[status]} fallback={status} />;
}

export function LeadStatusBadge({ status }) {
  return <Tag meta={LEAD_STATUS_META[status]} fallback={status} />;
}

export { ORDER_STATUS_META, PAYMENT_STATUS_META, LEAD_STATUS_META };
