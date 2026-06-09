function formatarStatus(status) {
  const statusNormalizado = String(status ?? '').toUpperCase();

  if (['OPTIMAL', 'OTIMO', 'ÓTIMO'].includes(statusNormalizado)) {
    return 'Ótimo';
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

export default function ResultadoOtimizacao({ resultado }) {
  if (!resultado) {
    return null;
  }

  const statusExibicao = formatarStatus(resultado.status);
  const solucaoEncontrada = statusExibicao === 'Ótimo';

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
            <p
              className={`mt-1 text-xl font-black ${
                solucaoEncontrada ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {statusExibicao}
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Total de funcionarios
            </p>
            <p className="mt-1 text-3xl font-black text-blue-950">{resultado.zAproximado}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {resultado.padroes?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                Escalas
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Periodos em que trabalha</th>
                      <th className="px-3 py-2 text-right font-semibold">Alocados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.padroes.map((padrao, index) => (
                      <tr key={`${padrao.nome}-${index}`} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{padrao.nome}</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-700">
                          {padrao.quantidadeAproximada}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultado.cobertura?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                Cobertura por periodo
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Periodo</th>
                      <th className="px-3 py-2 text-center font-semibold">Min.</th>
                      <th className="px-3 py-2 text-center font-semibold">Atend.</th>
                      <th className="px-3 py-2 text-right font-semibold">Sobra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.cobertura.map((periodo, index) => (
                      <tr key={`${periodo.periodo}-${index}`} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-900">{periodo.periodo}</td>
                        <td className="px-3 py-2 text-center text-slate-600">
                          {periodo.demandaMinima}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-green-700">
                          {periodo.atendidosAproximado}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-orange-600">
                          +{periodo.sobraAproximada}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
