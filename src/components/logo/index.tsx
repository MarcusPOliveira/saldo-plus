import React from 'react'

import { Calculator } from 'lucide-react'

export const Logo = () => {
  return (
    <a href="/" className="flex items-center justify-center gap-1">
      <Calculator className="stroke h-8 w-8 stroke-amber-500 stroke-[1.5]" />
      <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-2xl font-semibold leading-tight tracking-tighter text-transparent">
        Saldo
        <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-2xl font-semibold leading-tight tracking-tighter text-transparent">
          +
        </span>
      </p>
    </a>
  )
}
