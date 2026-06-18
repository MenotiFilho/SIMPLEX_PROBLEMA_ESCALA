import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarCenario, buscarResultado } from '../api/cenarios';
import ResultadoOtimizacao from '../components/ResultadoOtimizacao';
import { normalizarCenario } from '../utils/cenarioPayload';

export default function CenarioResultado() {
  const { id } = useParams();
  const [cenario, setCenario] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [semResultado, setSemResultado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        setErro('');
        setNaoEncontrado(false);
        setSemResultado(false);

        const cenarioEncontrado = await buscarCenario(id);
        const cenarioNormalizado = normalizarCenario(cenarioEncontrado);

        if (!ativo) {
          return;
        }

        setCenario(cenarioNormalizado);

        try {
          const solucao = await buscarResultado(id);
          if (ativo) {
            setResultado(solucao);
          }
        } catch (solutionError) {
          if (solutionError.status === 404) {
            setSemResultado(true);
          } else if (ativo) {
            setErro(solutionError.message);
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
  }, [id]);

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Carregando resultado...
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-950">Cenário não encontrado</h1>
        <p className="mt-2 text-sm text-slate-600">
          O cenário solicitado não existe ou foi removido.
        </p>
        <Link
          to="/cenarios"
          className="mt-5 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Voltar para lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Resultado</p>
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-950">
              {cenario?.nome}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{cenario?.descricao || 'Sem descrição'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/cenarios/${id}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Voltar ao cenário
            </Link>
           
          </div>
        </div>
      </header>

      {erro && (
        <div className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}

      {semResultado ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Sem resultado salvo</h2>
          <p className="mt-2 text-sm text-slate-600">
            Esse cenário ainda não foi resolvido. Volte para a edição e execute a solução.
          </p>
          <Link
            to={`/cenarios/${id}`}
            className="mt-5 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Resolver cenário
          </Link>
        </section>
      ) : (
        <ResultadoOtimizacao resultado={resultado} cenario={cenario} />
      )}
    </div>
  );
}
