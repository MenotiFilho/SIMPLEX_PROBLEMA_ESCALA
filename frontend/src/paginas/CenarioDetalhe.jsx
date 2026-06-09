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

export default function CenarioDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cenario, setCenario] = useState(null);
  const [resultado, setResultado] = useState(location.state?.resultado ?? null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [resolvendo, setResolvendo] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
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

        setCenario(normalizarCenario(cenarioEncontrado));

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setAviso('');
      const atualizado = await atualizarCenario(id, normalizarCenario(cenario));
      setCenario(normalizarCenario(atualizado));
      setResultado(null);
      setAviso('Cenario salvo. A solucao anterior foi invalidada; resolva novamente.');
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleResolver = async () => {
    try {
      setResolvendo(true);
      setErro('');
      setAviso('');
      const solucao = await resolverCenario(id);
      setResultado(solucao);
    } catch (error) {
      setErro(error.message);
    } finally {
      setResolvendo(false);
    }
  };

  if (carregando) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Carregando cenario...
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {cenario.nome || 'Cenario'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Edite o cenario salvo, resolva a escala e consulte a solucao persistida.
          </p>
        </div>
        <Link
          to="/cenarios"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Voltar para lista
        </Link>
      </header>

      {erro && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}

      {aviso && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {aviso}
        </div>
      )}

      <CenarioFormulario
        cenario={cenario}
        onChange={setCenario}
        onSubmit={handleSubmit}
        salvando={salvando}
        submitLabel="Salvar alteracoes"
      >
        <button
          type="button"
          onClick={handleResolver}
          disabled={resolvendo || salvando}
          className="rounded-md border border-green-200 bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {resolvendo ? 'Resolvendo...' : 'Resolver cenario'}
        </button>
      </CenarioFormulario>

      <ResultadoOtimizacao resultado={resultado} />
    </div>
  );
}
