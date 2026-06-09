import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  atualizarCenario,
  buscarCenario,
  buscarSolucao,
  resolverCenario,
} from '../api/cenarios';
import CenarioFormulario from '../components/CenarioFormulario';
import ResultadoOtimizacao from '../components/ResultadoOtimizacao';
import { normalizarCenario } from '../utils/cenarioPayload';

function chaveEstrutural(cenario) {
  const cenarioNormalizado = normalizarCenario(cenario);

  return JSON.stringify({
    periodos: cenarioNormalizado.periodos,
    regraTrabalhoFolga: cenarioNormalizado.regraTrabalhoFolga,
  });
}

function metadadosMudaram(cenarioAtual, cenarioOriginal) {
  if (!cenarioAtual || !cenarioOriginal) {
    return false;
  }

  return cenarioAtual.nome !== cenarioOriginal.nome || cenarioAtual.descricao !== cenarioOriginal.descricao;
}

export default function CenarioDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cenario, setCenario] = useState(null);
  const [cenarioOriginal, setCenarioOriginal] = useState(null);
  const [resultado, setResultado] = useState(location.state?.resultado ?? null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [resolvendo, setResolvendo] = useState(false);
  const [erro, setErro] = useState('');
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        setErro('');
        setNaoEncontrado(false);

        const cenarioEncontrado = await buscarCenario(id);
        if (!ativo) {
          return;
        }

        const cenarioNormalizado = normalizarCenario(cenarioEncontrado);
        setCenario(cenarioNormalizado);
        setCenarioOriginal(cenarioNormalizado);

        if (!location.state?.resultado) {
          try {
            const solucao = await buscarSolucao(id);
            if (ativo) {
              setResultado(solucao);
            }
          } catch (error) {
            if (ativo && error.status !== 404) {
              setErro(error.message);
            }
          }
        }
      } catch (error) {
        if (ativo) {
          if (error.status === 404) {
            setNaoEncontrado(true);
          } else {
            setErro(error.message);
          }
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
  }, [id, location.state?.resultado]);

  const salvarCenario = async () => {
    try {
      setSalvando(true);
      setErro('');
      const atualizado = await atualizarCenario(id, normalizarCenario(cenario));
      const cenarioNormalizado = normalizarCenario(atualizado);
      setCenario(cenarioNormalizado);
      setCenarioOriginal(cenarioNormalizado);
      return cenarioNormalizado;
    } catch (error) {
      setErro(error.message);
      return null;
    } finally {
      setSalvando(false);
    }
  };

  const handleResolver = async () => {
    try {
      setResolvendo(true);
      setErro('');
      const cenarioSalvo = await salvarCenario();
      if (!cenarioSalvo) {
        return;
      }
      const solucao = await resolverCenario(id);
      setResultado(solucao);
      setCenarioOriginal(cenarioSalvo);
    } catch (error) {
      setErro(error.message);
    } finally {
      setResolvendo(false);
    }
  };

  const atualizarCampoCenario = (campo, valor) => {
    setCenario((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvarMetadadosAoSair = async () => {
    if (!cenarioOriginal) {
      return;
    }

    const mudouEstrutura = chaveEstrutural(cenario) !== chaveEstrutural(cenarioOriginal);

    if (mudouEstrutura || !metadadosMudaram(cenario, cenarioOriginal)) {
      return;
    }

    await salvarCenario();
  };

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Carregando cenario...
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-950">Cenario nao encontrado</h1>
        <p className="mt-2 text-sm text-slate-600">
          O cenario solicitado nao existe ou foi removido.
        </p>
        <button
          type="button"
          onClick={() => navigate('/cenarios')}
          className="mt-5 rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const mudouEstrutura =
    cenarioOriginal && chaveEstrutural(cenario) !== chaveEstrutural(cenarioOriginal);
  const deveMostrarAcaoDeResolucao = mudouEstrutura || !resultado;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="shrink-0 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(220px,0.75fr)_minmax(260px,1.25fr)]">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Nome do cenario
              </label>
              <input
                type="text"
                value={cenario.nome}
                onChange={(event) => atualizarCampoCenario('nome', event.target.value)}
                onBlur={salvarMetadadosAoSair}
                className="w-full rounded-md border border-transparent bg-slate-50 px-3 py-2 text-xl font-extrabold tracking-tight text-slate-950 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Nome do cenario"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Descricao
              </label>
              <input
                type="text"
                value={cenario.descricao}
                onChange={(event) => atualizarCampoCenario('descricao', event.target.value)}
                onBlur={salvarMetadadosAoSair}
                className="w-full rounded-md border border-transparent bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Descricao do cenario"
              />
            </div>
          </div>
          <Link
            to="/cenarios"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Voltar para lista
          </Link>
        </div>
      </header>

      {erro && (
        <div className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(520px,0.95fr)_minmax(420px,1.05fr)] xl:grid-rows-1">
        <div className="min-h-0 overflow-y-auto">
          <CenarioFormulario
            cenario={cenario}
            onChange={setCenario}
          />
        </div>

        <div className="min-h-0 overflow-y-auto">
          {deveMostrarAcaoDeResolucao && (
            <div
              className={`mb-4 rounded-lg border p-4 ${
                mudouEstrutura ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-sm font-semibold ${
                    mudouEstrutura ? 'text-amber-900' : 'text-blue-900'
                  }`}
                >
                  {mudouEstrutura
                    ? 'O cenario mudou. Resolva novamente para atualizar a solucao.'
                    : 'Este cenario ainda nao possui solucao salva.'}
                </p>
                <button
                  type="button"
                  onClick={handleResolver}
                  disabled={resolvendo || salvando}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  {resolvendo || salvando
                    ? 'Atualizando...'
                    : mudouEstrutura
                      ? 'Resolver novamente'
                      : 'Resolver cenario'}
                </button>
              </div>
            </div>
          )}

          {resultado ? (
            <ResultadoOtimizacao resultado={resultado} />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Sem solucao exibida</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-600">
                  Ajuste regra e periodos para habilitar a resolucao do cenario.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
