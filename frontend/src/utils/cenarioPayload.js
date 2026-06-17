const PERIODOS_INICIAIS = [
  { nome: 'Turno 1', ordem: 1, demandaMinima: 0, ativo: true },
  { nome: 'Turno 2', ordem: 2, demandaMinima: 0, ativo: true },
];

export function criarCenarioVazio(nome = '', descricao = '') {
  return {
    nome,
    descricao,
    periodos: PERIODOS_INICIAIS.map((periodo) => ({ ...periodo })),
    regraTrabalhoFolga: {
      periodosTrabalhados: 1,
      periodosFolga: 1,
      circular: true,
    },
  };
}

export function normalizarCenario(cenario) {
  return {
    nome: cenario.nome ?? '',
    descricao: cenario.descricao ?? '',
    periodos: [...(cenario.periodos ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map((periodo, index) => ({
        id: periodo.id,
        nome: periodo.nome?.trim() || `Turno ${index + 1}`,
        ordem: index + 1,
        demandaMinima: Number(periodo.demandaMinima) || 0,
        ativo: periodo.ativo ?? true,
      })),
    regraTrabalhoFolga: {
      periodosTrabalhados: cenario.regraTrabalhoFolga?.periodosTrabalhados ?? 5,
      periodosFolga: cenario.regraTrabalhoFolga?.periodosFolga ?? 2,
      circular: cenario.regraTrabalhoFolga?.circular ?? true,
    },
  };
}
