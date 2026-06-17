import { Navigate, Route, Routes } from 'react-router-dom';
import CenarioDetalhe from './paginas/CenarioDetalhe';
import CenarioResultado from './paginas/CenarioResultado';
import CenariosLista from './paginas/CenariosLista';
import Home from './paginas/Home';

function App() {
  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-4 font-sans text-slate-800">
      <main className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cenarios" element={<CenariosLista />} />
          <Route path="/cenarios/novo" element={<Navigate to="/cenarios" replace />} />
          <Route path="/cenarios/:id" element={<CenarioDetalhe />} />
          <Route path="/cenarios/:id/resultado" element={<CenarioResultado />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
