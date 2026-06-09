const PERIODOS_PADRAO = [
  { nome: 'Segunda', ordem: 1, demandaMinima: 18, ativo: true },
  { nome: 'Terca', ordem: 2, demandaMinima: 12, ativo: true },
  { nome: 'Quarta', ordem: 3, demandaMinima: 15, ativo: true },
  { nome: 'Quinta', ordem: 4, demandaMinima: 19, ativo: true },
  { nome: 'Sexta', ordem: 5, demandaMinima: 14, ativo: true },
  { nome: 'Sabado', ordem: 6, demandaMinima: 16, ativo: true },
  { nome: 'Domingo', ordem: 7, demandaMinima: 11, ativo: true },
];

export function criarCenarioPadrao() {
  return {
    nome: 'Escala semanal LCL',
    descricao: 'Cenario de otimizacao',
    periodos: PERIODOS_PADRAO.map((periodo) => ({ ...periodo })),
    regraTrabalhoFolga: {
      periodosTrabalhados: 5,
      periodosFolga: 2,
      circular: true,
    },
  };
}

export function normalizarCenario(cenario) {
  return {
    nome: cenario.nome ?? '',
    descricao: cenario.descricao ?? '',
    periodos: [...(cenario.periodos ?? [])].sort((a, b) => a.ordem - b.ordem),
    regraTrabalhoFolga: {
      periodosTrabalhados: cenario.regraTrabalhoFolga?.periodosTrabalhados ?? 5,
      periodosFolga: cenario.regraTrabalhoFolga?.periodosFolga ?? 2,
      circular: cenario.regraTrabalhoFolga?.circular ?? true,
    },
  };
}
