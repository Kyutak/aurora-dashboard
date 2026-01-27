"use client"

import { useEffect, useState } from "react"
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
import axios from "axios";
import { verifyOTP } from "@/service/verifyOTP.service"
import { useSearchParams } from "next/navigation"



export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<"email" | "idoso">("email")
  const [step, setStep] = useState<"login" | "otp">("login")

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  //pop-up
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const emailFromRegister = searchParams.get("email")
  const forceOTP = searchParams.get("otp") === "true"
    
  useEffect(() => {
    if (emailFromRegister && forceOTP) {
      setEmail(emailFromRegister)
      setStep("otp")
    }
  }, [])

  /* ================= LOGIN EMAIL ================= */
  const handleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError("")

      await authService.login(email, senha)

      setPopupType("success");
      setPopupMessage("Código de verificação foi enviado para seu email");
      setShowPopup(true);

      // backend já enviou o OTP
      setStep("otp")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao realizar login")

      setPopupType("error");
      setPopupMessage(err?.response?.data?.message || "Erro ao realizar login");
      setShowPopup(true);
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

      const user = await verifyOTP(email, codigo)

      // salva sessão exatamente como a dashboard espera
      setSessionUser({ data: { user } })

      // normaliza role (evita erro silencioso)
      const role = user.role?.trim().toUpperCase()

      if (role === "FAMILIAR") {
        window.location.href = "/admin/dashboard"
        return
      }

      if (role === "FAMILIAR_COLABORADOR") {
        window.location.href = "/familiar/dashboard"
        return
      }

      if (role === "IDOSO") {
        window.location.href = "/idoso/dashboard"
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
      {/* Pop-up de notificação */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center space-y-4">
            <h2
              className={`text-xl font-bold ${
                popupType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popupType === "success" ? "Sucesso" : "Erro"}
            </h2>

            <p className="text-gray-700">{popupMessage}</p>
            
            <Button
              onClick={() => setShowPopup(false)}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
