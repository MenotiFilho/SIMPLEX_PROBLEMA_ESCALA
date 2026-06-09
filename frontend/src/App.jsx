import { Navigate, Route, Routes } from 'react-router-dom';
import CenarioDetalhe from './paginas/CenarioDetalhe';
import CenariosLista from './paginas/CenariosLista';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 font-sans text-slate-800">
      <main className="mx-auto max-w-6xl">
        <Routes>
          <Route path="/" element={<Navigate to="/cenarios" replace />} />
          <Route path="/cenarios" element={<CenariosLista />} />
          <Route path="/cenarios/novo" element={<Navigate to="/cenarios" replace />} />
          <Route path="/cenarios/:id" element={<CenarioDetalhe />} />
          <Route path="*" element={<Navigate to="/cenarios" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
