// utils/normalizers.js
// Centralized data normalization helpers for API responses

// Get currency symbol
const symbol = (c) => (c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : '');

export const normalizeCustomer = (c = {}) => {
  if (!c || typeof c !== 'object') return c;
  const first = c.firstName || c.first_name || '';
  const last = c.lastname || c.lastName || c.last_name || '';
  const company = c.company_name || c.company || '';
  const displayName = c.displayName || c.display_name || company || `${first} ${last}`.trim() || c.name || c.email || 'Unknown Customer';

  return {
    ...c,
    displayName,
    fullName: `${first} ${last}`.trim() || company || displayName,
    contact_details: c.contact_details || {
      emails: c.email ? [{ email: c.email }] : [],
      phones: c.phone ? [{ phone: c.phone }] : [],
    },
  };
};

export const normalizePayment = (p = {}) => {
  if (!p || typeof p !== 'object') return p;

  const amount = parseFloat(p.amount) || 0;
  const currency = (p.currency || 'USD').toUpperCase();

  const inv = p.invoice_details || {};
  const prod = inv.line_items?.[0]?.product_details || {};
  const agent = p.created_by_details || {};

  // Prefer name from invoice_details.customer_details, then payment.customer_details, etc.
  const customerName = inv.customer_details?.displayName ||
    p.customer_details?.displayName ||
    p.customer_details?.display_name ||
    (p.customer_details?.firstname && p.customer_details?.lastname ? `${p.customer_details.firstname} ${p.customer_details.lastname}` : '') ||
    p.customer?.displayName || p.customer?.name || p.customer_name || p.displayName || p.display_name || 'Unknown Customer';

  const invoiceNumber = inv.invoiceNumber || p.invoice_details?.invoice_number || p.invoice_number || (p.invoice ? String(p.invoice) : undefined);

  const statusNorm = typeof p.status === 'string'
    ? p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()
    : 'Pending';

  // Extract nested contact details when available
  const customer_email = inv.customer_details?.contact_details?.emails?.[0]?.email || p.customer_details?.contact_details?.emails?.[0]?.email || p.customer_details?.email || p.email || '';
  const customer_phone = inv.customer_details?.contact_details?.phones?.[0]?.phone || p.customer_details?.contact_details?.phones?.[0]?.phone || p.customer_details?.phone || p.phone || '';

  return {
    ...p,
    amount,
    currency,
    amountFormatted: `${symbol(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    customerName,
    customer_email,
    customer_phone,
    invoice_number: invoiceNumber,
    invoiceNumber,
    invoiceStatus: inv.status,
    productLabel: prod.label,
    salesAgent: agent.name || '',
    date: p.payment_date || p.created || p.created_at || '',
    paymentMethod: p.payment_method || p.paymentMethod,
    status: statusNorm,
  };
};

export default {
  normalizeCustomer,
  normalizePayment,
};
