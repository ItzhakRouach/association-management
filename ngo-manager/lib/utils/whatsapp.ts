/**
 * Builds a wa.me deep-link for WhatsApp.
 * Normalizes Israeli numbers: removes non-digits, strips leading 0, prepends 972.
 */
export function whatsappUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '972')
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
