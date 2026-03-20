import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Atividade } from "@/lib/shared-state"

interface Equipe {
  admin: any
  idosos: any[]
  colaboradores: any[]
}

export function gerarRelatorioPDF(atividades: Atividade[], equipe: Equipe) {
  // FILTRO DE OURO: Pega APENAS as atividades feitas pelo perfil 'idoso'
  const logsPacientes = atividades.filter(atv => atv.tipo === 'idoso')

  if (!logsPacientes || logsPacientes.length === 0) {
    alert("Não há tarefas concluídas pelos pacientes para gerar o relatório.")
    return
  }

  const doc = new jsPDF()
  const dataEmissao = new Date().toLocaleString('pt-BR')

  // Título e Cabeçalho
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("RELATÓRIO DE ACOMPANHAMENTO E ADESÃO", 14, 20)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Data de emissão: ${dataEmissao}`, 14, 28)

  // --- SESSÃO: REDE DE APOIO ---
  doc.setFillColor(240, 249, 248)
  doc.rect(14, 34, 182, 30, 'F')

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO MONITORAMENTO", 18, 42)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Responsável Familiar: ${equipe.admin?.name || 'Não informado'}`, 18, 48)

  const nomesIdosos = equipe.idosos.map(i => i.name).join(', ') || 'Nenhum cadastrado'
  doc.text(`Pacientes Monitorados: ${nomesIdosos}`, 18, 53)

  const nomesColaboradores = equipe.colaboradores.map(c => c.user?.name || 'Colaborador').join(', ') || 'Nenhum cadastrado'
  doc.text(`Cuidadores Cadastrados: ${nomesColaboradores}`, 18, 58)

  const atividadesPorData: Record<string, any[]> = {}
  let totalConcluidas = 0

  logsPacientes.forEach(atv => {
    if (!atv.timestamp) return
    const dataStr = new Date(atv.timestamp).toLocaleDateString('pt-BR')
    const horaStr = new Date(atv.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    if (!atividadesPorData[dataStr]) atividadesPorData[dataStr] = []

    // Limpeza do texto: Tira o "Concluiu o lembrete:" e as aspas para ficar parecendo um prontuário
    let descricaoLimpa = atv.acao.replace(/Concluiu o lembrete:/i, '').replace(/["']/g, '').trim()

    // Adiciona na linha do PDF
    atividadesPorData[dataStr].push([
      horaStr,
      atv.usuario || 'Paciente',
      descricaoLimpa.charAt(0).toUpperCase() + descricaoLimpa.slice(1), // Deixa a primeira letra maiúscula
      "Realizado" // Observação padrão de sucesso
    ])

    totalConcluidas++
  })

  let startY = 75

  // Imprime as tabelas agrupadas por dia
  Object.keys(atividadesPorData).forEach(data => {
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(`Data: ${data}`, 14, startY)

    autoTable(doc, {
      startY: startY + 5,
      head: [['Horário', 'Paciente', 'Atividade / Descrição', 'Observações']],
      body: atividadesPorData[data],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136] }, // Cor da sua paleta
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 }, // Horário
        1: { cellWidth: 40 }, // Paciente
        2: { cellWidth: 'auto' }, // Descrição
        3: { cellWidth: 30 }  // Status/Observação
      },
      margin: { left: 14, right: 14 }
    })

    startY = (doc as any).lastAutoTable.finalY + 15
  })

  if (startY > 250) {
    doc.addPage()
    startY = 20
  }

  // NOVO RESUMO PARA CLÍNICAS
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("RESUMO DE ADESÃO", 14, startY)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`• Total de atividades concluídas no período: ${totalConcluidas} registro(s).`, 14, startY + 10)
  doc.text(`• Adesão validada via sistema Aurora de acompanhamento em tempo real.`, 14, startY + 16)

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Este documento foi gerado eletronicamente e possui validade para acompanhamento clínico e familiar.", 14, doc.internal.pageSize.getHeight() - 15)
    doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 15)
  }

  doc.save(`Prontuario_Adesao_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`)
}