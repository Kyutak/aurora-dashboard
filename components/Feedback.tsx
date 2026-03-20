"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send } from "lucide-react"
import Image from "next/image"

export function SharedFeedback() {
  const { toast } = useToast()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const EMAIL_DESTINO = "auroraai.enterprise@gmail.com"
  const INSTAGRAM_URL = "https://instagram.com/aurora.app_"

  const handleEnviar = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" })
      return
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${EMAIL_DESTINO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    window.open(gmailUrl, "_blank")
    toast({ title: "Abrindo Gmail..." })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 md:pb-0">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Feedback
          </h1>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Card e-mail */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40">
              <Mail className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Enviar e-mail</p>
              <p className="text-xs text-slate-400">{EMAIL_DESTINO}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Assunto
              </label>
              <Input
                placeholder="Ex: Sugestão de melhoria"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Mensagem
              </label>
              <textarea
                placeholder="Conte o que você pensa sobre o Aurora..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
              />
            </div>

            <Button
              onClick={handleEnviar}
              className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm"
            >
              <Send className="w-4 h-4" />
              Enviar feedback
            </Button>
          </div>
        </div>

        {/* Instagram */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <Image
                src="/icon-instagram.jpg"
                alt="Instagram"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Instagram</p>
              <p className="text-xs text-slate-400">@aurora.app_</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

      </main>
    </div>
  )
}