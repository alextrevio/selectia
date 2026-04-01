import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Brain,
  BarChart3,
  Kanban,
  ArrowRight,
  ChevronDown,
  Check,
  Zap,
  Shield,
  Star,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight">
              select<span className="text-blue-600">.ia</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                Producto
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                Precios
              </a>
              <a href="#contacto" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                Contacto
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Empieza gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1">
              <Zap className="mr-1 h-3 w-3" /> Reclutamiento automatizado con IA
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
              Recluta con IA
              <br />
              <span className="text-blue-600">por WhatsApp</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Tu agente de inteligencia artificial entrevista y filtra candidatos 24/7.
              Tú solo revisas a los que ya están calificados.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-base px-8 h-12">
                  Empieza gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                  Ver cómo funciona
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="border-t border-gray-100 bg-gray-50/50 px-4 py-20 dark:border-gray-800 dark:bg-gray-900/30 sm:px-6 scroll-mt-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Cómo funciona
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Tres pasos simples para automatizar tu reclutamiento
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Publica tu vacante',
                  desc: 'Crea una oferta, configura las killer questions y obtén un código único para WhatsApp.',
                  icon: Kanban,
                },
                {
                  step: '02',
                  title: 'El agente IA entrevista',
                  desc: 'Los candidatos envían el código por WhatsApp y el agente IA los entrevista de forma natural.',
                  icon: Brain,
                },
                {
                  step: '03',
                  title: 'Revisa los calificados',
                  desc: 'Cada candidato recibe un score automático. Tú solo revisas los que pasaron el filtro.',
                  icon: Star,
                },
              ].map((item) => (
                <div key={item.step} className="relative rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                  <span className="text-4xl font-bold text-blue-100 dark:text-blue-900">{item.step}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Todo lo que necesitas
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Herramientas diseñadas para reclutadores modernos
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: Kanban,
                  title: 'Pipeline visual',
                  desc: 'Kanban board con drag & drop para gestionar candidatos por etapas. Ve tu pipeline completo de un vistazo.',
                  color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
                },
                {
                  icon: Shield,
                  title: 'Score automático',
                  desc: 'La IA evalúa cada respuesta del candidato y genera un score de 0-100 basado en tus killer questions.',
                  color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
                },
                {
                  icon: MessageCircle,
                  title: 'WhatsApp nativo',
                  desc: 'Los candidatos aplican directo por WhatsApp. Sin formularios, sin apps. Solo un mensaje.',
                  color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
                },
                {
                  icon: BarChart3,
                  title: 'Reportes en tiempo real',
                  desc: 'Dashboard con métricas de tu pipeline, tasas de conversión, fuentes de candidatos y más.',
                  color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
                },
              ].map((f) => (
                <Card key={f.title} className="border border-gray-200 dark:border-gray-800">
                  <CardContent className="pt-6">
                    <div className={`inline-flex rounded-lg p-2.5 ${f.color}`}>
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="border-t border-gray-100 bg-gray-50/50 px-4 py-20 dark:border-gray-800 dark:bg-gray-900/30 sm:px-6 scroll-mt-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Planes y precios
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Empieza gratis, escala cuando lo necesites
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Free */}
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Gratis</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">$0</span>
                    <span className="text-sm text-gray-500">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                    {['1 oferta activa', '50 candidatos/mes', '1 usuario', 'Agente IA básico', 'Pipeline Kanban'].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-gray-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full">Empezar gratis</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Starter — Popular */}
              <Card className="relative border-2 border-blue-600 dark:border-blue-500 shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-0.5 text-xs">Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Starter</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">$499</span>
                    <span className="text-sm text-gray-500"> MXN/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                    {['5 ofertas activas', '300 candidatos/mes', '3 usuarios', 'Agente IA avanzado', 'Pipeline + Reportes', 'Soporte por email'].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-600 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Elegir Starter</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">$1,499</span>
                    <span className="text-sm text-gray-500"> MXN/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                    {['Ofertas ilimitadas', 'Candidatos ilimitados', '10 usuarios', 'Analytics avanzados', 'API access', 'Soporte prioritario'].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-gray-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full">Elegir Pro</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              * El costo de publicidad en Meta se cobra por separado, al costo.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="contacto" className="px-4 py-20 sm:px-6 scroll-mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ¿Listo para reclutar con IA?
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Crea tu cuenta en menos de 2 minutos. No necesitas tarjeta de crédito.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-base px-8 h-12">
                  Empieza gratis ahora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-900/50 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <span className="text-lg font-bold tracking-tight">
                select<span className="text-blue-600">.ia</span>
              </span>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Reclutamiento inteligente con IA y WhatsApp.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#como-funciona" className="hover:text-gray-900 dark:hover:text-gray-100">Cómo funciona</a></li>
                <li><a href="#pricing" className="hover:text-gray-900 dark:hover:text-gray-100">Precios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Sobre nosotros</a></li>
                <li><a href="#contacto" className="hover:text-gray-900 dark:hover:text-gray-100">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Privacidad</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-100">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-xs text-gray-400">
            &copy; 2026 select.ia — Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
