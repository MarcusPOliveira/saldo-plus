export const MAX_DATE_RANGE_DAYS = 90

export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência / Boleto' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value']
