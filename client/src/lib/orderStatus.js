// Mirrors the server's order lifecycle (server/src/index.js ORDER_FLOW) so the customer-facing
// progress stepper and the admin status-update control both agree on the sequence.
export const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const ORDER_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function orderStepIndex(status) {
  return ORDER_FLOW.indexOf(status);
}

export function nextAllowedOrderStatuses(status) {
  if (status === 'delivered' || status === 'cancelled') return [];
  const idx = orderStepIndex(status);
  const forward = idx === -1 ? [] : ORDER_FLOW.slice(idx + 1);
  return [...forward, 'cancelled'];
}
