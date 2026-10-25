import { Separator } from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { CurrencyComboBox, Logo } from '@/components'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'

async function Wizard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'Usuário'

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl">
          Bem-vindo, <span className="font-bold">{firstName}! 👋🏻</span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Vamos configurar sua moeda padrão.
        </h2>

        <h3 className="mt-2 text-center text-sm text-muted-foreground">
          Você pode alterar isso a qualquer momento nas configurações.
        </h3>
      </div>
      <Separator />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Moeda</CardTitle>
          <CardDescription>
            Escolha sua moeda padrão para as transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>
      <Separator />

      <Button className="w-full" asChild>
        <Link href="/dashboard">Continuar</Link>
      </Button>

      <div className="mt-8">
        <Logo />
      </div>
    </div>
  )
}

export default Wizard
