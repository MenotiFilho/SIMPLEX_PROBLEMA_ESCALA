export default function CenarioFormulario({
  cenario,
  onChange,
  onSubmit,
  salvando,
  submitLabel = 'Salvar cenario',
  children,
}) {
  const atualizarCampo = (campo, valor) => {
    onChange({ ...cenario, [campo]: valor });
  };

  const atualizarPeriodo = (ordem, campo, valor) => {
    onChange({
      ...cenario,
      periodos: cenario.periodos.map((periodo) =>
        periodo.ordem === ordem ? { ...periodo, [campo]: valor } : periodo,
      ),
    });
  };

  const atualizarRegra = (campo, valor) => {
    onChange({
      ...cenario,
      regraTrabalhoFolga: {
        ...cenario.regraTrabalhoFolga,
        [campo]: valor,
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-900 px-6 py-4">
        <h2 className="text-lg font-bold text-white">Configuracao do Cenario</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.5fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nome do cenario
            </label>
            <input
              type="text"
              value={cenario.nome}
              onChange={(event) => atualizarCampo('nome', event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descricao
            </label>
            <input
              type="text"
              value={cenario.descricao}
              onChange={(event) => atualizarCampo('descricao', event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
            <h3 className="text-base font-bold text-slate-900">Demandas minimas</h3>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cenario.periodos.length} periodos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {cenario.periodos.map((periodo) => (
              <div
                key={periodo.ordem}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <label className="mb-2 block text-center text-xs font-bold uppercase text-slate-500">
                  {periodo.nome}
                </label>
                <input
                  type="number"
                  min="0"
                  value={periodo.demandaMinima}
                  onChange={(event) =>
                    atualizarPeriodo(periodo.ordem, 'demandaMinima', Number(event.target.value))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-center text-lg font-bold text-blue-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 border-b border-slate-200 pb-2 text-base font-bold text-slate-900">
            Regras de trabalho
          </h3>
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-5 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-blue-950">
                Periodos trabalhados
              </label>
              <input
                type="number"
                min="1"
                value={cenario.regraTrabalhoFolga.periodosTrabalhados}
                onChange={(event) =>
                  atualizarRegra('periodosTrabalhados', Number(event.target.value))
                }
                className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-blue-950">
                Periodos de folga
              </label>
              <input
                type="number"
                min="1"
                value={cenario.regraTrabalhoFolga.periodosFolga}
                onChange={(event) => atualizarRegra('periodosFolga', Number(event.target.value))}
                className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <label className="flex items-center gap-3 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-950 md:self-end">
              <input
                type="checkbox"
                checked={cenario.regraTrabalhoFolga.circular}
                onChange={(event) => atualizarRegra('circular', event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Escala circular
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
          {children}
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {salvando ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
