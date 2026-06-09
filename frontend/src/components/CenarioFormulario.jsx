export default function CenarioFormulario({
  cenario,
  onChange,
  onSubmit,
  salvando,
  submitLabel = 'Salvar cenario',
  children,
}) {
  const totalPeriodos = cenario.periodos.length;
  const totalRegra =
    cenario.regraTrabalhoFolga.periodosTrabalhados + cenario.regraTrabalhoFolga.periodosFolga;
  const regraMaiorQuePeriodos = totalRegra > totalPeriodos;

  const atualizarCampo = (campo, valor) => {
    onChange({ ...cenario, [campo]: valor });
  };

  const atualizarPeriodo = (index, campo, valor) => {
    onChange({
      ...cenario,
      periodos: cenario.periodos.map((periodo, periodoIndex) =>
        periodoIndex === index ? { ...periodo, [campo]: valor } : periodo,
      ),
    });
  };

  const adicionarPeriodo = () => {
    const proximaOrdem = cenario.periodos.length + 1;

    onChange({
      ...cenario,
      periodos: [
        ...cenario.periodos,
        {
          nome: `Periodo ${proximaOrdem}`,
          ordem: proximaOrdem,
          demandaMinima: 0,
          ativo: true,
        },
      ],
    });
  };

  const removerPeriodo = (index) => {
    if (cenario.periodos.length <= 1) {
      return;
    }

    onChange({
      ...cenario,
      periodos: cenario.periodos
        .filter((_, periodoIndex) => periodoIndex !== index)
        .map((periodo, periodoIndex) => ({ ...periodo, ordem: periodoIndex + 1 })),
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
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Periodos e demandas</h3>
              <p className="mt-1 text-sm text-slate-500">
                Nomeie cada periodo para representar escalas semanais, turnos ou ciclos como 12x36.
              </p>
            </div>
            <button
              type="button"
              onClick={adicionarPeriodo}
              className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              Adicionar periodo
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cenario.periodos.map((periodo, index) => (
              <div
                key={`${periodo.ordem}-${index}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={periodo.nome}
                    onChange={(event) => atualizarPeriodo(index, 'nome', event.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-0 py-1 text-base font-extrabold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:px-2 focus:ring-2 focus:ring-blue-100"
                    placeholder={`Periodo ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removerPeriodo(index)}
                    disabled={cenario.periodos.length <= 1}
                    className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remover
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Demanda minima
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={periodo.demandaMinima}
                    onChange={(event) =>
                      atualizarPeriodo(index, 'demandaMinima', Number(event.target.value))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-center text-sm font-bold text-blue-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
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
          {regraMaiorQuePeriodos && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              A soma de periodos trabalhados e folga ({totalRegra}) deve ser menor ou igual ao
              total de periodos ({totalPeriodos}).
            </p>
          )}
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
