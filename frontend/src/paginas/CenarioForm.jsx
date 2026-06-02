import { useState } from 'react';

export default function CenarioForm() {
  const [nome, setNome] = useState('Escala semanal LCL');
  const [demandas, setDemandas] = useState([
    { day: 'SEGUNDA', label: 'Segunda', position: 1, demand: 18 },
    { day: 'TERCA', label: 'Terça', position: 2, demand: 12 },
    { day: 'QUARTA', label: 'Quarta', position: 3, demand: 15 },
    { day: 'QUINTA', label: 'Quinta', position: 4, demand: 19 },
    { day: 'SEXTA', label: 'Sexta', position: 5, demand: 14 },
    { day: 'SABADO', label: 'Sábado', position: 6, demand: 16 },
    { day: 'DOMINGO', label: 'Domingo', position: 7, demand: 11 }
  ]);
  const [workDays, setWorkDays] = useState(5);
  const [restDays, setRestDays] = useState(2);
  const [circular, setCircular] = useState(true);
  const [resultadoOtimizacao, setResultadoOtimizacao] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const atualizarDemanda = (position, novaDemanda) => {
    const novasDemandas = demandas.map((item) => {
      if (item.position === position) {
        return { ...item, demand: Number(novaDemanda) };
      }
      return item;
    });
    setDemandas(novasDemandas);
  };

  const otimizarEscala = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const periodosFormatados = demandas.map(item => ({
      dia: item.day,
      nome: item.label,
      ordem: item.position,
      demandaMinima: item.demand,
      ativo: true 
    }));

    const payload = {
      nome: nome,
      descricao: "Cenário de otimização",
      periodos: periodosFormatados,
      regraTrabalhoFolga: {
        periodosTrabalhados: workDays, 
        periodosFolga: restDays, 
        circular: circular
      }
    };

    try {
      const resposta = await fetch('http://localhost:8080/api/v1/scenarios/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resultado = await resposta.json();
      setResultadoOtimizacao(resultado);
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Falha na comunicação com o servidor!");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Otimizador de Escalas</h1>
          <p className="text-gray-500 mt-2">Configuração do modelo Simplex e integração GLOP</p>
        </div>

        {/* Formulário Principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-blue-600 px-8 py-4">
            <h2 className="text-xl font-bold text-white">Configuração do Cenário</h2>
          </div>
          
          <form onSubmit={otimizarEscala} className="p-8 space-y-8">
            {/* Nome do Cenário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Cenário</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Demandas */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Demandas Mínimas Diárias</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {demandas.map((item) => (
                  <div key={item.position} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{item.label}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={item.demand} 
                      onChange={(e) => atualizarDemanda(item.position, e.target.value)}
                      className="w-full text-center text-xl font-bold text-blue-700 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Regras */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Regras de Trabalho</h3>
              <div className="flex flex-wrap gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Dias Trabalhados</label>
                  <input 
                    type="number" min="1" value={workDays} 
                    onChange={(e) => setWorkDays(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Dias de Folga</label>
                  <input 
                    type="number" min="1" value={restDays} 
                    onChange={(e) => setRestDays(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                  />
                </div>
                <div className="flex items-center mt-6 bg-white px-4 py-2 rounded-lg border border-blue-200">
                  <input 
                    type="checkbox" id="circular" checked={circular} 
                    onChange={(e) => setCircular(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="circular" className="ml-3 text-sm font-bold text-blue-900 cursor-pointer">
                    Escala Circular
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={carregando}
              className={`w-full text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all text-lg tracking-wide ${carregando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
            >
              {carregando ? 'Calculando Matriz...' : 'Resolver Otimização (GLOP)'}
            </button>
          </form>
        </div>

        {/* Dashboard de Resultados */}
        {/* Dashboard de Resultados */}
        {resultadoOtimizacao && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-green-500">
            <div className="p-8">
              <div className="flex items-center mb-8">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">Solução Ótima Encontrada</h2>
              </div>
              
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Status do Solver</p>
                  <p className="text-2xl font-black text-green-600">{resultadoOtimizacao.status}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Total de Funcionários (Z)</p>
                  <p className="text-5xl font-black text-blue-900">
                    {resultadoOtimizacao.zAproximado}
                  </p>
                </div>
              </div>

              {/* Tabelas de Dados (Renderizam se os Arrays existirem) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Padrões */}
                {resultadoOtimizacao.padroes && resultadoOtimizacao.padroes.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-sm py-1 px-3 rounded-full mr-3">Padrões</span>
                      Alocação
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Regra</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Funcionários</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resultadoOtimizacao.padroes.map((padrao, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{padrao.nome}</td>
                              <td className="px-4 py-3 font-bold text-blue-600 text-right">{padrao.quantidadeAproximada}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Cobertura Diária */}
                {resultadoOtimizacao.cobertura && resultadoOtimizacao.cobertura.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="bg-purple-100 text-purple-800 text-sm py-1 px-3 rounded-full mr-3">Escala</span>
                      Cobertura
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Dia</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Mínimo</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Atendidos</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Sobra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resultadoOtimizacao.cobertura.map((dia, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-900">{dia.periodo}</td>
                              <td className="px-4 py-3 text-gray-600 text-center">{dia.demandaMinima}</td>
                              <td className="px-4 py-3 font-bold text-green-600 text-center">{dia.atendidosAproximado}</td>
                              <td className="px-4 py-3 font-medium text-orange-500 text-right">+{dia.sobraAproximada}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}