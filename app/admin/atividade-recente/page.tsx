"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity, Loader2, RefreshCw, FileText } from "lucide-react"
import { useAuroraSync } from "@/hooks/use-sync" 
import { sharedState, Atividade } from "@/lib/shared-state"
import { elderService } from "@/service/elder.service" 
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function AtividadeRecentePage() {
  const { atividades } = useAuroraSync(); 
  const [loading, setLoading] = useState(true);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elderService.getLogs(); 
      if (Array.isArray(data)) {
        sharedState.setAtividades(data);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  // FUNÇÃO QUE GERA O PDF NO FRONT-END
  const gerarRelatorioPDF = () => {
    if (!atividades || atividades.length === 0) {
      alert("Não há atividades para gerar o relatório.");
      return;
    }

    const doc = new jsPDF();
    const dataEmissao = new Date().toLocaleString('pt-BR');
    
    // Título e Cabeçalho
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO SEMANAL DE ATIVIDADES", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data de emissão: ${dataEmissao}`, 14, 30);

    // Agrupar atividades por data e calcular totais
    const atividadesPorData: Record<string, any[]> = {};
    const resumoTipos: Record<string, number> = {};

    atividades.forEach(atv => {
      if (!atv.timestamp) return;
      const dataStr = new Date(atv.timestamp).toLocaleDateString('pt-BR');
      const horaStr = new Date(atv.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      if (!atividadesPorData[dataStr]) atividadesPorData[dataStr] = [];
      
      const tipoFormatado = atv.tipo === 'admin' ? 'Gestão' : atv.tipo;
      
      atividadesPorData[dataStr].push([
        horaStr,
        tipoFormatado,
        atv.acao
      ]);

      // Contagem para o Resumo
      resumoTipos[tipoFormatado] = (resumoTipos[tipoFormatado] || 0) + 1;
    });

    let startY = 40;

    // Gerar uma tabela para cada data
    Object.keys(atividadesPorData).forEach(data => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(data, 14, startY);
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Horário', 'Tipo', 'Descrição']],
        body: atividadesPorData[data],
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] }, // Cor teal-600 para combinar com seu layout
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
    });

    // Adicionar Resumo do Período
    // Checa se precisa de uma nova página para não cortar o resumo
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO DO PERÍODO", 14, startY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let resumoY = startY + 10;
    Object.entries(resumoTipos).forEach(([tipo, quantidade]) => {
      doc.text(`• ${tipo}: ${quantidade}`, 14, resumoY);
      resumoY += 7;
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "Este documento foi gerado eletronicamente e é válido sem assinatura.",
        14,
        doc.internal.pageSize.getHeight() - 15
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 15
      );
    }

    // Salvar o arquivo
    doc.save(`Relatorio_Atividades_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
          
          <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-400 z-0" />
          
          <div className="relative z-10 pt-16 px-6 max-w-5xl mx-auto">
             <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Atividades</h1>
                  <p className="text-teal-50 opacity-90 font-medium">Monitoramento em tempo real</p>
                </div>
                
                <div className="flex gap-3">
                  {/* NOVO BOTÃO DE GERAR PDF */}
                  <Button 
                    variant="ghost" 
                    onClick={gerarRelatorioPDF}
                    disabled={loading || atividades.length === 0}
                    className="text-teal-700 bg-white hover:bg-gray-100 gap-2 font-bold shadow-lg"
                  >
                    <FileText className="w-4 h-4" />
                    Baixar Relatório PDF
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={carregarHistorico}
                    disabled={loading}
                    className="text-white hover:bg-white/20 gap-2 border border-white/30 backdrop-blur-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </Button>
                </div>
             </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-250px)] border border-white/20">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                <Activity className="text-teal-500 w-6 h-6" /> Histórico de Eventos
              </h2>
              <div className="h-[2px] mt-4 mb-8 bg-gray-100 dark:bg-gray-800 w-full" />

              <div className="space-y-4">
                {loading && atividades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-teal-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Buscando registros no servidor...</p>
                  </div>
                ) : atividades && atividades.length > 0 ? (
                  atividades.map((atv: Atividade, index: number) => (
                    <div 
                      key={atv.id || `atv-${index}`} 
                      className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 hover:border-teal-200 transition-colors shadow-sm"
                    >
                      <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-inner bg-gradient-to-br ${
                        atv.tipo === 'idoso' 
                          ? 'from-emerald-400 to-emerald-600' 
                          : atv.tipo === 'admin' 
                            ? 'from-teal-500 to-teal-700' 
                            : 'from-blue-400 to-blue-600'
                      }`}>
                        {atv.usuario ? atv.usuario[0].toUpperCase() : 'A'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{atv.usuario || "Sistema"}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                              {atv.acao}
                            </p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              atv.tipo === 'idoso' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            } 
                          >
                            {atv.tipo === 'admin' ? 'Gestão' : atv.tipo}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 text-xs font-medium text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {atv.timestamp ? new Date(atv.timestamp).toLocaleString('pt-BR') : 'Agora'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">Nenhuma atividade recente encontrada.</p>
                    <p className="text-sm">As ações realizadas aparecerão aqui automaticamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'default';
}

function Button({ className, children, variant, ...props }: ButtonProps) {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}