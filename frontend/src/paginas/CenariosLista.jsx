import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarCenario, excluirCenario, listarCenarios, resolverCenario } from '../api/cenarios';
import { criarCenarioVazio } from '../utils/cenarioPayload';

function descreverRegra(cenario) {
  const regra = cenario.regraTrabalhoFolga;
  if (!regra) {
    return '-';
  }

  return `${regra.periodosTrabalhados} trabalho / ${regra.periodosFolga} folga${
    regra.circular ? ' circular' : ''
  }`;
}

export default function CenariosLista() {
  const navigate = useNavigate();
  const [cenarios, setCenarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindoId, setExcluindoId] = useState(null);
  const [resolvendoId, setResolvendoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [descricaoNova, setDescricaoNova] = useState('');
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        setErro('');
        const dados = await listarCenarios();
        if (ativo) {
          setCenarios(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const handleExcluir = async (cenario) => {
    const confirmar = window.confirm(`Excluir o cenario "${cenario.nome}"?`);
    if (!confirmar) {
      return;
    }

    try {
      setExcluindoId(cenario.id);
      setErro('');
      await excluirCenario(cenario.id);
      setCenarios((atuais) => atuais.filter((item) => item.id !== cenario.id));
    } catch (error) {
      setErro(error.message);
    } finally {
      setExcluindoId(null);
    }
  };

  const handleResolver = async (cenario) => {
    try {
      setResolvendoId(cenario.id);
      setErro('');
      const resultado = await resolverCenario(cenario.id);
      navigate(`/cenarios/${cenario.id}`, { state: { resultado } });
    } catch (error) {
      setErro(error.message);
    } finally {
      setResolvendoId(null);
    }
  };

  const abrirModalCriacao = () => {
    setNomeNovo('');
    setDescricaoNova('');
    setErro('');
    setModalAberto(true);
  };

  const fecharModalCriacao = () => {
    if (!criando) {
      setModalAberto(false);
    }
  };

  const handleCriar = async (event) => {
    event.preventDefault();

    try {
      setCriando(true);
      setErro('');
      const cenario = await criarCenario(criarCenarioVazio(nomeNovo.trim(), descricaoNova.trim()));
      navigate(`/cenarios/${cenario.id}`);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="shrink-0 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Cenarios de escala
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Gerencie os cenarios salvos e resolva escalas persistidas no banco.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalCriacao}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Novo cenario
          </button>
        </div>
      </header>

      {erro && (
        <div className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}

      <section className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {carregando ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Carregando cenarios...
          </div>
        ) : cenarios.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">Nenhum cenario criado</h2>
            <p className="mt-2 text-sm text-slate-600">
              Crie o primeiro cenario para salvar, editar e consultar solucoes.
            </p>
            <button
              type="button"
              onClick={abrirModalCriacao}
              className="mt-5 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Criar cenario
            </button>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4 font-bold">Nome</th>
                  <th className="px-5 py-4 font-bold">Descricao</th>
                  <th className="px-5 py-4 text-center font-bold">Periodos</th>
                  <th className="px-5 py-4 font-bold">Regra</th>
                  <th className="px-5 py-4 text-right font-bold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cenarios.map((cenario) => (
                  <tr key={cenario.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        to={`/cenarios/${cenario.id}`}
                        className="font-bold text-blue-700 hover:text-blue-900"
                      >
                        {cenario.nome}
                      </Link>
                    </td>
                    <td className="max-w-[280px] truncate px-5 py-4 text-slate-600">
                      {cenario.descricao || '-'}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-800">
                      {cenario.periodos?.length ?? 0}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{descreverRegra(cenario)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/cenarios/${cenario.id}`}
                          className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Abrir
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleResolver(cenario)}
                          disabled={resolvendoId === cenario.id}
                          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {resolvendoId === cenario.id ? 'Resolvendo...' : 'Resolver'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExcluir(cenario)}
                          disabled={excluindoId === cenario.id}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {excluindoId === cenario.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-extrabold text-slate-950">Novo cenario</h2>
              <p className="mt-1 text-sm text-slate-600">
                Informe os dados iniciais. O cenario sera criado zerado para edicao.
              </p>
            </div>

            <form onSubmit={handleCriar} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nome do cenario
                </label>
                <input
                  type="text"
                  value={nomeNovo}
                  onChange={(event) => setNomeNovo(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descricao
                </label>
                <textarea
                  value={descricaoNova}
                  onChange={(event) => setDescricaoNova(event.target.value)}
                  className="min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalCriacao}
                  disabled={criando}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criando}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {criando ? 'Criando...' : 'Criar e editar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
