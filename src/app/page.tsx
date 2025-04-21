'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CreditCard,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Logo, ThemeSwitch } from '@/components'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LandingPage() {
  const checkSession = useQuery({
    queryKey: ['user'],
    queryFn: async () =>
      await fetch('/api/check-session').then((res) => res.json()),
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <nav className="hidden flex-col gap-4 md:flex md:flex-row md:gap-6">
            <Link
              href="#recursos"
              className="text-sm font-medium transition-colors hover:text-orange-500"
            >
              Recursos
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium transition-colors hover:text-orange-500"
            >
              Como Funciona
            </Link>
            <Link
              href="#depoimentos"
              className="text-sm font-medium transition-colors hover:text-orange-500"
            >
              Depoimentos
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <Link
              href={checkSession.data?.isLoggedIn ? '/dashboard' : '/sign-in'}
              className="text-sm font-medium transition-colors hover:text-orange-500"
            >
              Entrar
            </Link>
            <Button className="hidden bg-orange-500 hover:bg-orange-600 md:flex">
              <Link
                href={checkSession.data?.isLoggedIn ? '/dashboard' : '/sign-up'}
              >
                Cadastre-se Grátis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container flex flex-col items-center gap-8 md:flex-row md:gap-16">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Controle suas finanças com facilidade e precisão
              </h1>
              <p className="text-lg text-muted-foreground">
                Acompanhe seus gastos, crie orçamentos e alcance seus objetivos
                financeiros com nossa plataforma intuitiva.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    checkSession.data?.isLoggedIn
                      ? redirect('/dashboard')
                      : redirect('/sign-up')
                  }}
                >
                  Comece Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Image
                src="/hero-image.png"
                width={600}
                height={500}
                alt="Dashboard de controle financeiro"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="recursos"
          className="bg-orange-50 py-20 dark:bg-orange-950/30"
        >
          <div className="container space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Recursos Poderosos
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Nossa plataforma oferece tudo o que você precisa para gerenciar
                suas finanças pessoais de forma eficiente.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <CreditCard className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Controle de Gastos</h3>
                <p className="text-muted-foreground">
                  Registre e categorize suas despesas para entender para onde
                  seu dinheiro está indo.
                </p>
              </Card>

              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <PieChart className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  Orçamentos Personalizados
                </h3>
                <p className="text-muted-foreground">
                  Crie orçamentos para diferentes categorias e receba alertas
                  quando estiver próximo do limite.
                </p>
              </Card>

              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Análise Financeira</h3>
                <p className="text-muted-foreground">
                  Visualize relatórios detalhados e gráficos para entender seus
                  hábitos financeiros.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="py-20">
          <div className="container">
            <div className="mb-12 space-y-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Como Funciona</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Comece a controlar suas finanças em apenas três passos simples.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-2xl font-bold text-orange-500">1</span>
                </div>
                <h3 className="text-xl font-bold">Crie sua conta</h3>
                <p className="text-muted-foreground">
                  Registre-se gratuitamente e configure seu perfil financeiro em
                  minutos.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-2xl font-bold text-orange-500">2</span>
                </div>
                <h3 className="text-xl font-bold">Conecte suas contas</h3>
                <p className="text-muted-foreground">
                  Sincronize com seus bancos ou adicione transações manualmente
                  para começar a rastrear.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-2xl font-bold text-orange-500">3</span>
                </div>
                <h3 className="text-xl font-bold">Gerencie suas finanças</h3>
                <p className="text-muted-foreground">
                  Acompanhe seus gastos, defina metas e tome decisões
                  financeiras mais inteligentes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="depoimentos"
          className="bg-orange-50 py-20 dark:bg-orange-950/30"
        >
          <div className="container space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                O Que Nossos Usuários Dizem
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Milhares de pessoas já transformaram suas finanças com nossa
                plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold">Ana Silva</h4>
                    <p className="text-sm text-muted-foreground">Professora</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &quot;Finalmente consegui organizar minhas finanças e
                  economizar para minha viagem dos sonhos. A plataforma é super
                  intuitiva!&quot;
                </p>
              </Card>

              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold">Carlos Mendes</h4>
                    <p className="text-sm text-muted-foreground">Engenheiro</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &quot;Os relatórios detalhados me ajudaram a identificar
                  gastos desnecessários que eu nem percebia que tinha.&quot;
                </p>
              </Card>

              <Card className="rounded-lg p-6 shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold">Juliana Costa</h4>
                    <p className="text-sm text-muted-foreground">
                      Empreendedora
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &quot;Como empreendedora, precisava de uma ferramenta para
                  separar gastos pessoais e do negócio. Esta plataforma faz isso
                  perfeitamente!&quot;
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <Card className="rounded-xl bg-orange-500 p-8 text-secondary md:p-12">
              <div className="mx-auto max-w-3xl space-y-6 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Pronto para transformar suas finanças?
                </h2>
                <p className="text-lg opacity-90">
                  Junte-se a milhares de usuários que já estão economizando mais
                  e gastando melhor.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-orange-500 hover:bg-orange-50 dark:text-secondary"
                  onClick={() => {
                    checkSession.data?.isLoggedIn
                      ? redirect('/dashboard')
                      : redirect('/sign-up')
                  }}
                >
                  Comece Gratuitamente
                </Button>
                <p className="text-sm">
                  Não é necessário cartão de crédito. Cancele quando quiser.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                Simplificando o controle financeiro para todos os brasileiros.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-bold">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Aplicativo
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Segurança
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-bold">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Carreiras
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-bold">Suporte</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Contato
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-orange-500"
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Saldo+. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
