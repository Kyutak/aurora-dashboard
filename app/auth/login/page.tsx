import { Suspense } from "react"
import LoginClient from "./LoginClient"

export default function LoginPage() {
  return (
    // O fallback pode ser um spinner ou uma tela vazia bonita
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 flex items-center justify-center">
        <div className="text-white font-bold animate-pulse">Carregando Aurora...</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}