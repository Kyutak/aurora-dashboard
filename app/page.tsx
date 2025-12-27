"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-blue-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-lg">Aurora</h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow">Cuidado conectado para toda a família</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center shadow-2xl rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Bem-vindo à Aurora
            </h2>
            <p className="text-muted-foreground mb-8">
              Sistema de cuidados integrado para idosos, familiares e administradores
            </p>
            <div className="space-y-4">
              <Link href="/auth/login" className="block">
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full h-14 text-lg border-2 bg-transparent">
                  Criar Conta
                </Button>
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">Acesso rápido para demonstração:</p>
              <div className="grid grid-cols-3 gap-2">
                <Link href="/idoso/dashboard">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Idoso
                  </Button>
                </Link>
                <Link href="/familiar/dashboard">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Familiar
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Admin
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
