"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Key, User } from "lucide-react"

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
import { verifyOTP } from "@/service/verifyOTP.service"

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<"email" | "idoso">("email")
  const [step, setStep] = useState<"login" | "otp">("login")

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [popupType, setPopupType] = useState<"success" | "error">("success")

  useEffect(() => {
    const emailFromRegister = searchParams.get("email")
    const forceOTP = searchParams.get("otp") === "true"

    if (emailFromRegister) {
      setEmail(emailFromRegister)
      if (forceOTP) setStep("otp")
    }
  }, [searchParams])

  const handleLogin = async () => {
    if (loading) return
    try {
      setLoading(true)
      setError("")
      await authService.login(email, senha)
      setPopupType("success")
      setPopupMessage("Código de verificação enviado para seu email")
      setShowPopup(true)
      setStep("otp")
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao realizar login"
      setError(msg)
      setPopupType("error")
      setPopupMessage(msg)
      setShowPopup(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    try {
      setLoading(true)
      setError("")
      
      const { user, token } = await verifyOTP(email, codigo)
      
      setSessionUser({ data: { user } })

      sessionStorage.setItem("authToken", token)

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem("userName",user.name)

      const role = user.role?.trim().toUpperCase();
      setTimeout(() => {
        if (role === "FAMILIAR") router.push("/admin/dashboard");
        else if (role === "FAMILIAR_COLABORADOR") router.push("/familiar/dashboard");
        else if (role === "IDOSO") router.push("/idoso/dashboard");
        else setError("Tipo de usuário não reconhecido");
      }, 200); 
    } catch (err: any) {
      setError(err?.response?.data?.message || "Código inválido ou expirado")
    } finally {
      setLoading(false)
    }
  }

  const resendCodeLogin = async () => {
    if (loading) return
    try {
      setLoading(true)
      setError("")
      await authService.resendOTP(email)
      setPopupType("success")
      setPopupMessage("Código de verificação reenviado")
      setShowPopup(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao reenviar"
      setError(msg)
      setPopupType("error")
      setPopupMessage(msg)
      setShowPopup(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl relative">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-teal-600">Aurora</CardTitle>
          <CardDescription>Entre na sua conta</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="email">Familiar</TabsTrigger>
              <TabsTrigger value="idoso">Idoso</TabsTrigger>
            </TabsList>

            {/* CONTEÚDO PARA FAMILIAR / EMAIL */}
            <TabsContent value="email">
              {step === "login" ? (
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2"><Mail size={16} /> Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Lock size={16} /> Senha</Label>
                    <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                    {loading ? "Enviando..." : "Entrar"}
                  </Button>
                </form>
              ) : null}
            </TabsContent>

            {/* CONTEÚDO PARA IDOSO */}
            <TabsContent value="idoso">
              {step === "login" ? (
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2"><User size={16} /> Email do Idoso</Label>
                    <Input type="email" placeholder="Seu email cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Lock size={16} /> Senha</Label>
                    <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                    {loading ? "Enviando..." : "Entrar como Idoso"}
                  </Button>
                </form>
              ) : null}
            </TabsContent>
          </Tabs>

          {/* STEP DE OTP (FORA DAS TABS PARA NÃO REPETIR CÓDIGO) */}
          {step === "otp" && (
            <form onSubmit={handleCodeLogin} className="space-y-4 mt-4">
              <Label className="flex items-center gap-2 font-bold text-teal-700">
                <Key size={16} /> Código enviado para {email}
              </Label>
              <Input 
                value={codigo} 
                onChange={(e) => setCodigo(e.target.value)} 
                maxLength={6} 
                className="text-center text-2xl tracking-widest font-bold border-teal-200" 
                required 
                autoFocus
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-teal-600" disabled={loading}>
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
              <div className="flex flex-col gap-2">
                <Button variant="link" type="button" onClick={resendCodeLogin} disabled={loading} className="text-teal-600">
                  Reenviar código
                </Button>
                <Button variant="ghost" type="button" onClick={() => setStep("login")} className="text-xs">
                  Voltar
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não tem conta? <Link href="/auth/register" className="text-teal-600 font-bold">Cadastre-se</Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* POPUP DE FEEDBACK */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h2 className={`text-2xl font-bold mb-2 ${popupType === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {popupType === "success" ? "Sucesso!" : "Ops!"}
            </h2>
            <p className="text-gray-600 mb-6">{popupMessage}</p>
            <Button onClick={() => setShowPopup(false)} className="w-full bg-teal-600 py-6">Entendido</Button>
          </div>
        </div>
      )}
    </div>
  )
}