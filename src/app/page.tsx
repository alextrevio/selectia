import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase, MessageCircle, Brain, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Selectia</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button>Comenzar gratis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center lg:py-32">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight lg:text-6xl">
            Reclutamiento inteligente con{' '}
            <span className="text-primary">IA y WhatsApp</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Automatiza tu proceso de selección. Un agente de IA entrevista
            candidatos por WhatsApp, los evalúa y te presenta solo los mejores.
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg">Crear cuenta gratuita</Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/50 px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">WhatsApp Integrado</h3>
              <p className="text-sm text-muted-foreground">
                Los candidatos aplican directamente por WhatsApp. Sin formularios,
                sin fricciones.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">IA que Entrevista</h3>
              <p className="text-sm text-muted-foreground">
                Nuestro agente IA hace killer questions, evalúa respuestas y
                genera un score automático.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Pipeline Visual</h3>
              <p className="text-sm text-muted-foreground">
                Kanban board para gestionar tu pipeline. Mueve candidatos entre
                etapas con drag & drop.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Selectia. Todos los derechos reservados.
      </footer>
    </div>
  )
}
