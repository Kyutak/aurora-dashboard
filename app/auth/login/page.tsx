"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Key } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { authService } from "@/service/auth.service"
import { setSessionUser } from "@/lib/auth-state"

export default function LoginPage() {
  const router = useRouter()

  const [tab, setTab] = useState<"email" | "idoso">("email")
  const [step, setStep] = useState<"login" | "otp">("login")

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= LOGIN EMAIL ================= */
  const handleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError("")

      await authService.login(email, senha)

      // backend já enviou o OTP
      setStep("otp")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao realizar login")
    } finally {
      setLoading(false)
    }
  }

  /* ================= OTP ================= */
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      setError("")

      const { data } = await authService.verifyOTP(email, codigo)

      // salva token
      document.cookie = `token=${data.token}; path=/`

      // salva sessão exatamente como a dashboard espera
      setSessionUser({ data: { user: data.user } })

      // normaliza role (evita erro silencioso)
      const role = data.user.role?.trim().toUpperCase()

      if (role === "FAMILIAR") {
        router.push("/admin/dashboard")
        return
      }

      if (role === "FAMILIAR_COLABORADOR") {
        router.push("/familiar/dashboard")
        return
      }

      if (role === "IDOSO") {
        router.push("/idoso/dashboard")
        return
      }

      setError("Tipo de usuário não reconhecido")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Código inválido ou expirado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-teal-600">
            Aurora
          </CardTitle>
          <CardDescription>Entre na sua conta</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="idoso">Idoso</TabsTrigger>
            </TabsList>

            {/* ================= ABA EMAIL ================= */}
            <TabsContent value="email">
              {step === "login" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Lock size={16} /> Senha
                    </Label>
                    <Input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleCodeLogin} className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Key size={16} /> Código de verificação
                  </Label>

                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />

                  {error && (
                    <p className="text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={loading}>
                    {loading ? "Verificando..." : "Verificar código"}
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* ================= ABA IDOSO ================= */}
            <TabsContent value="idoso">
              <p className="text-center text-sm text-muted-foreground">
                Login para idosos em desenvolvimento.
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm">
              Não tem conta?{" "}
              <Link href="/auth/register" className="text-teal-600">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
