import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(135deg,#ffffff_0%,#eff6ff_58%,#e2e8f0_100%)]" />
      <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full border border-blue-200/70" />
      <div className="absolute -right-20 top-12 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 grid w-full grid-cols-1 items-center gap-10 p-8 md:grid-cols-[1.05fr_0.95fr] md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700">
            Otimização de escalas
          </span>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Escala Simplex
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 md:text-lg">
            Monte cenários de trabalho e folga, defina demandas por turno e encontre uma distribuição
            otimizada de funcionários para cobrir a operação com clareza.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cenarios"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Entrar no app
            </Link>
          </div>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-2xl border border-blue-100 bg-slate-950 p-5 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(37,99,235,0.45),transparent_38%),radial-gradient(circle_at_78%_20%,rgba(125,211,252,0.35),transparent_28%)]" />
          <div className="relative flex h-full min-h-72 flex-col justify-between rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
          

            <div className="grid grid-cols-3 gap-3">
              {[18, 12, 15, 12 ,14,16].map((demanda, index) => (
                <div key={demanda} className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
                    Turno {index + 1}
                  </p>
                  <p className="mt-2 text-2xl font-black">{demanda}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
