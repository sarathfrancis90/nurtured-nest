export function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPhoneLink(phone: string) {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function formatWhatsAppLink(number: string, prefill: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}
