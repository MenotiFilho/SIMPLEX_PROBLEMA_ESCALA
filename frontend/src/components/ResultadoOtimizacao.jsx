export default function ResultadoOtimizacao({ resultado }) {
  if (!resultado) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
      <div className="border-b border-green-100 bg-green-50 px-6 py-4">
        <h2 className="text-xl font-extrabold text-slate-900">Solucao de otimizacao</h2>
      </div>

      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Status do solver
            </p>
            <p className="mt-2 text-2xl font-black text-green-700">{resultado.status}</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Total de funcionarios
            </p>
            <p className="mt-2 text-5xl font-black text-blue-950">{resultado.zAproximado}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {resultado.padroes?.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-bold text-slate-900">Padroes de alocacao</h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Regra</th>
                      <th className="px-4 py-3 text-right font-semibold">Funcionarios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.padroes.map((padrao, index) => (
                      <tr key={`${padrao.nome}-${index}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{padrao.nome}</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-700">
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
              <h3 className="mb-3 text-lg font-bold text-slate-900">Cobertura por periodo</h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Periodo</th>
                      <th className="px-4 py-3 text-center font-semibold">Minimo</th>
                      <th className="px-4 py-3 text-center font-semibold">Atendidos</th>
                      <th className="px-4 py-3 text-right font-semibold">Sobra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.cobertura.map((periodo, index) => (
                      <tr key={`${periodo.periodo}-${index}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{periodo.periodo}</td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {periodo.demandaMinima}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-green-700">
                          {periodo.atendidosAproximado}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-orange-600">
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
