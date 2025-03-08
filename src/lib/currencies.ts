export const currencies = [
  {
    value: 'USD',
    label: '$ Dollar',
    locale: 'en-US',
  },
  {
    value: 'EUR',
    label: '€ Euro',
    locale: 'de-DE',
  },
  {
    value: 'REAL',
    label: 'R$ Real',
    locale: 'pt-BR',
  },
  {
    value: 'GBP',
    label: '£ Pound',
    locale: 'en-GB',
  },
  {
    value: 'BITCOIN',
    label: '₿ Bitcoin',
    locale: 'en-US',
  },
]

export type Currency = (typeof currencies)[0]
