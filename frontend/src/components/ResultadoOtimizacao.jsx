import { useState } from 'react';

function formatarStatus(status) {
  const statusNormalizado = String(status ?? '').toUpperCase();

  if (['OPTIMAL', 'OTIMO', 'ÓTIMO'].includes(statusNormalizado)) {
    return 'Ótima';
  }

  if (
    ['INFEASIBLE', 'NO_SOLUTION', 'NOT_SOLVED', 'UNBOUNDED', 'SOLUCAO_NAO_ENCONTRADA'].includes(
      statusNormalizado,
    )
  ) {
    return 'Solução não encontrada';
  }

  return status || 'Solução não encontrada';
}

function formatarNumero(valor, fixarDuasCasas = false) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fixarDuasCasas || !Number.isInteger(numero) ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numero);
}

function valorAlocado(padrao) {
  return padrao.quantidadeInteira ?? padrao.quantidadeAproximada ?? padrao.quantidadeContinua;
}

function arredondarPreservandoTotal(valores, total, casasDecimais = 2) {
  const fator = 10 ** casasDecimais;
  const alvo = Math.round(Number(total ?? 0) * fator);
  const base = valores.map((valor, index) => {
    const escalado = Number(valor ?? 0) * fator;
    const piso = Math.floor(escalado);

    return {
      index,
      piso,
      resto: escalado - piso,
    };
  });

  let diferenca = alvo - base.reduce((soma, item) => soma + item.piso, 0);
  const ordenados = [...base].sort((a, b) => b.resto - a.resto || a.index - b.index);

  for (let i = 0; i < ordenados.length && diferenca > 0; i++) {
    ordenados[i].piso += 1;
    diferenca -= 1;
  }

  return base.map((item) => item.piso / fator);
}

function separarPeriodosDoPadrao(padrao, periodosDisponiveis) {
  const trabalha = String(padrao.nome ?? '')
    .split(',')
    .map((periodo) => periodo.trim())
    .filter(Boolean);

  const folgasInformadas = (padrao.folgas ?? padrao.periodosFolga ?? padrao.descanso ?? [])
    .map((periodo) => String(periodo).trim())
    .filter(Boolean);
  const folga =
    folgasInformadas.length > 0
      ? folgasInformadas
      : periodosDisponiveis.filter((periodo) => !trabalha.includes(periodo));

  return { trabalha, folga };
}

function juntarComE(itens) {
  if (itens.length === 0) {
    return 'Não informado';
  }

  if (itens.length === 1) {
    return itens[0];
  }

  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

function calcularSaldo(periodo) {
  const alocado = Number(periodo.atendidosAproximado ?? periodo.atendidosContinuo ?? 0);
  const minimo = Number(periodo.demandaMinima ?? 0);

  return alocado - minimo;
}

export default function ResultadoOtimizacao({ resultado, cenario, aviso }) {
  const [mostrarNaoUtilizadas, setMostrarNaoUtilizadas] = useState(false);
  const [visualizacaoCobertura, setVisualizacaoCobertura] = useState('tabela');

  if (!resultado) {
    return null;
  }

  const statusExibicao = formatarStatus(resultado.status);
  const solucaoEncontrada = statusExibicao === 'Ótima';
  const valorObjetivo = resultado.zInteiro ?? resultado.zAproximado ?? resultado.zContinuo;
  const todosPadroes = resultado.padroes ?? [];
  const alocadosExibidos = arredondarPreservandoTotal(
    todosPadroes.map(valorAlocado),
    valorObjetivo,
  );
  const padroesComQuantidade = todosPadroes.map((padrao, index) => ({
    ...padrao,
    quantidadeExibida: alocadosExibidos[index] ?? Number(valorAlocado(padrao) ?? 0),
  }));
  const padroesUtilizados = padroesComQuantidade.filter((padrao) => padrao.quantidadeExibida > 0);
  const padroesNaoUtilizados = padroesComQuantidade.filter((padrao) => padrao.quantidadeExibida <= 0);
  const cobertura = resultado.cobertura ?? [];
  const periodosDisponiveis =
    cenario?.periodos
      ?.filter((periodo) => periodo.ativo ?? true)
      .sort((a, b) => a.ordem - b.ordem)
      .map((periodo) => periodo.nome) ?? cobertura.map((periodo) => periodo.periodo);

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-4 pb-2">
        {aviso && (
          <div
            className={`rounded-lg border px-4 py-3 ${
              aviso.tipo === 'alterado'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
          >
            <p className="text-sm font-semibold">{aviso.mensagem}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Solução</p>
            <p
              className={`mt-2 text-3xl font-black leading-none ${
                solucaoEncontrada ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {statusExibicao}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Equipe mínima</p>
            <p className="mt-2 text-4xl font-black leading-none text-blue-950">
              {formatarNumero(valorObjetivo, true)}
              <span className="ml-2 text-lg font-extrabold text-slate-600">funcionários</span>
            </p>
          </article>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-blue-700">
            Escalas recomendadas
          </h2>

          {padroesUtilizados.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              Nenhuma escala utilizada nesta solução.
            </p>
          ) : (
            <div className="space-y-3">
              {padroesUtilizados.map((padrao, index) => {
                const { trabalha, folga } = separarPeriodosDoPadrao(padrao, periodosDisponiveis);

                return (
                  <article
                    key={`${padrao.variavel ?? padrao.nome}-${index}`}
                    className="grid overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70 sm:grid-cols-[8.75rem_1fr]"
                  >
                    <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 sm:border-b-0 sm:border-r">
                      <p className="text-5xl font-black leading-none text-blue-950">
                        {formatarNumero(padrao.quantidadeExibida, true)}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-slate-700">funcionários</p>
                    </div>

                    <div className="flex flex-col justify-center gap-3 p-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
                        <span className="min-w-20 text-sm font-black text-slate-700">Trabalha:</span>
                        <div className="flex flex-wrap gap-2">
                          {trabalha.map((periodo) => (
                            <span
                              key={periodo}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-900"
                            >
                              {periodo}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 lg:flex-row">
                        <span className="min-w-20 text-sm font-black text-slate-700">Folgas:</span>
                        <span className="text-sm font-semibold text-slate-600">{juntarComE(folga)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {padroesNaoUtilizados.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setMostrarNaoUtilizadas((atual) => !atual)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span
                  className={`text-lg leading-none transition ${
                    mostrarNaoUtilizadas ? 'rotate-180' : ''
                  }`}
                >
                  ⌄
                </span>
                {padroesNaoUtilizados.length} escala
                {padroesNaoUtilizados.length > 1 ? 's' : ''} não utilizada
                {padroesNaoUtilizados.length > 1 ? 's' : ''}
              </button>

              {mostrarNaoUtilizadas && (
                <div className="mt-2 space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  {padroesNaoUtilizados.map((padrao, index) => {
                    const { trabalha, folga } = separarPeriodosDoPadrao(
                      padrao,
                      periodosDisponiveis,
                    );

                    return (
                      <p
                        key={`${padrao.variavel ?? padrao.nome}-nao-utilizado-${index}`}
                        className="text-sm font-semibold text-slate-600"
                      >
                        <strong className="text-slate-800">0 funcionários</strong> -{' '}
                        {juntarComE(trabalha)}. Folgas: {juntarComE(folga)}.
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {cobertura.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-black uppercase tracking-wide text-blue-700">
                Cobertura por período
              </h2>
              <button
                type="button"
                onClick={() =>
                  setVisualizacaoCobertura((atual) => (atual === 'tabela' ? 'cards' : 'tabela'))
                }
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Alternar visão
              </button>
            </div>

            <div className={visualizacaoCobertura === 'cards' ? 'hidden' : ''}>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-separate border-spacing-0 bg-white text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-black">Período</th>
                      <th className="px-4 py-3 text-center font-black">Mínimo</th>
                      <th className="px-4 py-3 text-center font-black">Alocado</th>
                      <th className="px-4 py-3 text-center font-black">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobertura.map((periodo, index) => {
                      const alocado = periodo.atendidosAproximado ?? periodo.atendidosContinuo;
                      const saldo = periodo.sobraAproximada ?? periodo.sobraContinua ?? calcularSaldo(periodo);
                      const saldoPositivo = Number(saldo) > 0;

                      return (
                        <tr
                          key={`${periodo.periodo}-${index}`}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="border-t border-slate-100 px-4 py-3 font-black text-slate-900">
                            {periodo.periodo}
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 text-center font-semibold text-slate-600">
                            {periodo.demandaMinima}
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 text-center font-black text-slate-800">
                            {formatarNumero(alocado, true)}
                          </td>
                          <td
                            className={`border-t border-slate-100 px-4 py-3 text-center font-black ${
                              saldoPositivo ? 'text-green-700' : 'text-slate-700'
                            }`}
                          >
                            {saldoPositivo ? '+' : ''}
                            {formatarNumero(saldo, true)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
                visualizacaoCobertura === 'cards' ? '' : 'hidden'
              }`}
            >
              {cobertura.map((periodo, index) => {
                const alocado = periodo.atendidosAproximado ?? periodo.atendidosContinuo;
                const saldo = periodo.sobraAproximada ?? periodo.sobraContinua ?? calcularSaldo(periodo);
                const saldoPositivo = Number(saldo) > 0;

                return (
                  <article
                    key={`${periodo.periodo}-card-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <h3 className="font-black text-slate-900">{periodo.periodo}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      Mínimo: {periodo.demandaMinima}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Alocado: {formatarNumero(alocado, true)}
                    </p>
                    <p
                      className={`mt-2 text-sm font-black ${
                        saldoPositivo ? 'text-green-700' : 'text-slate-700'
                      }`}
                    >
                      Saldo: {saldoPositivo ? '+' : ''}
                      {formatarNumero(saldo, true)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
