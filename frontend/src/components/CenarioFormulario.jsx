export default function CenarioFormulario({
  cenario,
  onChange,
  children,
}) {
  const criarTurnos12x36 = (quantidadeTurnos) =>
    Array.from({ length: quantidadeTurnos }, (_, index) => {
      const dia = Math.floor(index / 2) + 1;
      const horario = index % 2 === 0 ? '07h-19h' : '19h-07h';

      return {
        nome: `Dia ${dia} ${horario}`,
        demandaMinima: 0,
        ativo: true,
      };
    });

  const presets = {
    semanal: {
      label: 'Semanal 5x2',
      periodos: [
        { nome: 'Domingo', demandaMinima: 0, ativo: true },
        { nome: 'Segunda', demandaMinima: 0, ativo: true },
        { nome: 'Terca', demandaMinima: 0, ativo: true },
        { nome: 'Quarta', demandaMinima: 0, ativo: true },
        { nome: 'Quinta', demandaMinima: 0, ativo: true },
        { nome: 'Sexta', demandaMinima: 0, ativo: true },
        { nome: 'Sabado', demandaMinima: 0, ativo: true },
      ],
      regraTrabalhoFolga: {
        periodosTrabalhados: 5,
        periodosFolga: 2,
        circular: true,
      },
    },
    '12x36-8': {
      label: '12x36 - 8 turnos',
      periodos: criarTurnos12x36(8),
      regraTrabalhoFolga: {
        periodosTrabalhados: 1,
        periodosFolga: 3,
        circular: true,
      },
    },
    '12x36-12': {
      label: '12x36 - 12 turnos',
      periodos: criarTurnos12x36(12),
      regraTrabalhoFolga: {
        periodosTrabalhados: 1,
        periodosFolga: 3,
        circular: true,
      },
    },
    '12x36-28': {
      label: '12x36 - 28 turnos',
      periodos: criarTurnos12x36(28),
      regraTrabalhoFolga: {
        periodosTrabalhados: 1,
        periodosFolga: 3,
        circular: true,
      },
    },
  };

  const totalPeriodos = cenario.periodos.length;
  const totalRegra =
    cenario.regraTrabalhoFolga.periodosTrabalhados + cenario.regraTrabalhoFolga.periodosFolga;
  const regraMaiorQuePeriodos = totalRegra > totalPeriodos;

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
          nome: `Turno ${proximaOrdem}`,
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

  const aplicarPreset = (presetKey) => {
    const preset = presets[presetKey];

    if (!preset) {
      return;
    }

    onChange({
      ...cenario,
      periodos: preset.periodos.map((periodo, index) => ({
        ...periodo,
        ordem: index + 1,
      })),
      regraTrabalhoFolga: preset.regraTrabalhoFolga,
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
      <form onSubmit={(event) => event.preventDefault()} className="space-y-8 p-6">
        <section>
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Turnos e demandas</h3>
              <p className="mt-1 text-sm text-slate-500">
                Nomeie cada turno para representar escalas semanais, jornadas ou ciclos como 12x36.
              </p>
            </div>
            <select
              defaultValue=""
              onChange={(event) => {
                aplicarPreset(event.target.value);
                event.target.value = '';
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>
                Padrões
              </option>
              {Object.entries(presets).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

                  <section>
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-blue-950">
                Turnos trabalhados
              </label>
              <input
                type="number"
                min="1"
                value={cenario.regraTrabalhoFolga.periodosTrabalhados}
                onChange={(event) =>
                  atualizarRegra('periodosTrabalhados', Number(event.target.value))
                }
                className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-blue-950">
                Turnos de folga
              </label>
              <input
                type="number"
                min="1"
                value={cenario.regraTrabalhoFolga.periodosFolga}
                onChange={(event) => atualizarRegra('periodosFolga', Number(event.target.value))}
                className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <label className="flex h-10 items-center gap-3 rounded-md border border-blue-200 bg-white px-4 text-sm font-bold text-blue-950">
              <input
                type="checkbox"
                checked={cenario.regraTrabalhoFolga.circular}
                onChange={(event) => atualizarRegra('circular', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Circular
            </label>
          </div>
          {regraMaiorQuePeriodos && (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              A soma de turnos trabalhados e folga ({totalRegra}) deve ser menor ou igual ao
              total de turnos ({totalPeriodos}).
            </p>
          )}
        </section>

          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={adicionarPeriodo}
              className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              Adicionar turno
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-14 px-3 py-2 font-bold">#</th>
                    <th className="px-3 py-2 font-bold">Turno</th>
                    <th className="w-36 px-3 py-2 text-center font-bold">Demanda</th>
                    <th className="w-24 px-3 py-2 text-right font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cenario.periodos.map((periodo, index) => (
                    <tr key={`${periodo.ordem}-${index}`} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={periodo.nome}
                          onChange={(event) => atualizarPeriodo(index, 'nome', event.target.value)}
                          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          placeholder={`Turno ${index + 1}`}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={periodo.demandaMinima}
                          onChange={(event) =>
                            atualizarPeriodo(index, 'demandaMinima', Number(event.target.value))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-center font-bold text-blue-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removerPeriodo(index)}
                          disabled={cenario.periodos.length <= 1}
                          className="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {children && (
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
            {children}
          </div>
        )}
      </form>
    </div>
  );
}
