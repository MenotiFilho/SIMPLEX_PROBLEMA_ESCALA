import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarCenario } from '../api/cenarios';
import CenarioFormulario from '../components/CenarioFormulario';
import { criarCenarioPadrao, normalizarCenario } from '../utils/cenarioPayload';

export default function CenarioNovo() {
  const navigate = useNavigate();
  const [cenario, setCenario] = useState(() => criarCenarioPadrao());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      const criado = await criarCenario(normalizarCenario(cenario));
      navigate(`/cenarios/${criado.id}`);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Novo cenario
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Salve o cenario para liberar a resolucao persistida.
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

      <CenarioFormulario
        cenario={cenario}
        onChange={setCenario}
        onSubmit={handleSubmit}
        salvando={salvando}
        submitLabel="Criar cenario"
      />
    </div>
  );
}
