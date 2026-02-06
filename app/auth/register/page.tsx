"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setSessionUser } from "@/lib/auth-state"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, CreditCard } from "lucide-react"
import {authService} from "@/service/auth.service"
import { authCollaboratorService } from "@/service/collaborator.service"
import type { AxiosError } from "axios"

export default function RegisterPage() {
  const router = useRouter()

  // Admin fields
  const [adminNome, setAdminNome] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminSenha, setAdminSenha] = useState("")

  // Familiar fields
  const [familiarNome, setFamiliarNome] = useState("")
  const [familiarEmail, setFamiliarEmail] = useState("")
  const [familiarSenha, setFamiliarSenha] = useState("")
  const [cpfIdoso, setCpfIdoso] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdminRegister = async (adminNome: string, adminEmail: string, adminSenha: string) => {

    if(loading) return
    try {
      setError("")
      await authService.register(adminNome, adminEmail, adminSenha)

      setSuccess("Conta criada com sucesso! Redirecionando...")
      setTimeout(() => {
        window.location.href = `/auth/login?email=${adminEmail}&otp=true`
      }, 2000);
    } catch(err) {
      setError("Erro ao criar conta. Tente novamente."+ err)
    }
  }

  const handleFamiliarRegister = async (name: string, email: string, password: string, cpf: string) => {
    if(loading) return
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      await authCollaboratorService.register(name, email, password, cpf)
      setSuccess("Conta criada com sucesso! Redirecionando...")

      setTimeout(()=>{
        window.location.href = `/auth/login?email=${email}&otp=true`
      },2000)
    }catch(err){
      const axiosError = err as AxiosError<{ message: string }>;
      const msg = axiosError?.response?.data?.message || "Erro ao criar conta familiar. Verifique os dados.";
      setError(msg);
    }
    finally{
      setLoading(false)
    }
  }


  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Aurora
          </CardTitle>
          <CardDescription className="text-base">Crie sua conta</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="familiar">Familiar</TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <form onSubmit={(e)=>{
                e.preventDefault(),
                handleAdminRegister(adminNome, adminEmail, adminSenha)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-nome" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="admin-nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={adminNome}
                    onChange={(e) => setAdminNome(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-senha" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <Input
                    id="admin-senha"
                    type="password"
                    placeholder="••••••••"
                    value={adminSenha}
                    onChange={(e) => setAdminSenha(e.target.value)}
                    required
                    minLength={6}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  disabled= {loading}
                >
                  {loading ? "Criando conta admin..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="familiar">
              <form onSubmit={(e)=>{
                e.preventDefault(),
                handleFamiliarRegister(familiarNome, familiarEmail, familiarSenha, cpfIdoso)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familiar-nome" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="familiar-nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={familiarNome}
                    onChange={(e) => setFamiliarNome(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familiar-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="familiar-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={familiarEmail}
                    onChange={(e) => setFamiliarEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familiar-senha" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <Input
                    id="familiar-senha"
                    type="password"
                    placeholder="••••••••"
                    value={familiarSenha}
                    onChange={(e) => setFamiliarSenha(e.target.value)}
                    required
                    minLength={6}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf-idoso" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    CPF do Idoso
                  </Label>
                  <Input
                    id="cpf-idoso"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpfIdoso}
                    onChange={(e) => setCpfIdoso(formatCPF(e.target.value))}
                    required
                    maxLength={14}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">CPF do idoso que você irá cuidar</p>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  disabled={loading}
                >
                  {loading ? "Criando Conta..." : "Criar Conta Familiar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
