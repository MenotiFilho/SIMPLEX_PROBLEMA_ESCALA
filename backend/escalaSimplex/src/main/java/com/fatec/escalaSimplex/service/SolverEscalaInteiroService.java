package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.CoberturaPeriodo;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import com.fatec.escalaSimplex.domain.ResultadoPadrao;
import com.google.ortools.Loader;
import com.google.ortools.linearsolver.MPConstraint;
import com.google.ortools.linearsolver.MPObjective;
import com.google.ortools.linearsolver.MPSolver;
import com.google.ortools.linearsolver.MPVariable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolverEscalaInteiroService {

    private static final double EPSILON = 0.000001;

    private final CoberturaService coberturaService;
    private final ModeloMatematicoService modeloMatematicoService;

    public ResultadoOtimizacao resolver(
            CenarioEscala cenario,
            List<PadraoEscala> padroes
    ) {
        return resolver(cenario, padroes, List.of());
    }

    public ResultadoOtimizacao resolver(
            CenarioEscala cenario,
            List<PadraoEscala> padroes,
            List<ResultadoPadrao> referenciaContinua
    ) {
        Loader.loadNativeLibraries();

        List<PeriodoEscala> periodosAtivosOrdenados = cenario.periodos()
                .stream()
                .filter(PeriodoEscala::ativo)
                .sorted(Comparator.comparingInt(PeriodoEscala::ordem))
                .toList();

        SolucaoMip solucaoMinima = resolverMinimizandoTotal(
                periodosAtivosOrdenados,
                padroes
        );

        if (!solucaoMinima.encontrada()) {
            return new ResultadoOtimizacao(
                    solucaoMinima.status(),
                    0.0,
                    0,
                    List.of(),
                    List.of(),
                    "O solver inteiro não encontrou solução viável."
            );
        }

        SolucaoMip solucaoFinal = resolverAproximandoReferenciaContinua(
                periodosAtivosOrdenados,
                padroes,
                referenciaContinua,
                solucaoMinima.zInteiro()
        );

        if (!solucaoFinal.encontrada()) {
            solucaoFinal = solucaoMinima;
        }

        List<ResultadoPadrao> resultadoPadroes = montarResultadoPadroes(
                padroes,
                solucaoFinal.quantidades()
        );

        List<CoberturaPeriodo> cobertura = coberturaService.calcularInteira(
                periodosAtivosOrdenados,
                padroes,
                solucaoFinal.variaveis()
        );

        String modeloMatematico = modeloMatematicoService.gerarInteiro(
                periodosAtivosOrdenados,
                padroes
        );

        return new ResultadoOtimizacao(
                solucaoFinal.status(),
                solucaoFinal.zInteiro(),
                solucaoFinal.zInteiro(),
                resultadoPadroes,
                cobertura,
                modeloMatematico
        );
    }

    private SolucaoMip resolverMinimizandoTotal(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes
    ) {
        MPSolver solver = criarSolverScip();
        double infinito = MPSolver.infinity();

        MPVariable[] variaveis = criarVariaveisInteiras(solver, padroes, infinito);

        criarRestricoesCobertura(
                solver,
                periodos,
                padroes,
                variaveis,
                infinito
        );

        criarFuncaoObjetivo(solver, variaveis);

        MPSolver.ResultStatus status = solver.solve();

        if (!solucaoEncontrada(status)) {
            return SolucaoMip.naoEncontrada(status.name());
        }

        int[] quantidades = extrairQuantidades(variaveis);
        int zInteiro = somar(quantidades);

        return new SolucaoMip(status.name(), zInteiro, quantidades, variaveis);
    }

    private SolucaoMip resolverAproximandoReferenciaContinua(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            List<ResultadoPadrao> referenciaContinua,
            int zInteiroOtimo
    ) {
        if (referenciaContinua == null || referenciaContinua.size() != padroes.size()) {
            return SolucaoMip.naoEncontrada("REFERENCIA_CONTINUA_INDISPONIVEL");
        }

        MPSolver solver = criarSolverScip();
        double infinito = MPSolver.infinity();

        MPVariable[] variaveis = criarVariaveisInteiras(solver, padroes, infinito);

        criarRestricoesCobertura(
                solver,
                periodos,
                padroes,
                variaveis,
                infinito
        );

        criarRestricaoTotalOtimo(solver, variaveis, zInteiroOtimo);
        criarObjetivoDeProximidade(solver, variaveis, referenciaContinua, infinito);

        MPSolver.ResultStatus status = solver.solve();

        if (!solucaoEncontrada(status)) {
            return SolucaoMip.naoEncontrada(status.name());
        }

        int[] quantidades = extrairQuantidades(variaveis);

        return new SolucaoMip(status.name(), somar(quantidades), quantidades, variaveis);
    }

    private MPSolver criarSolverScip() {
        MPSolver solver = MPSolver.createSolver("SCIP");

        if (solver == null) {
            throw new IllegalStateException("Não foi possível criar o solver SCIP.");
        }

        return solver;
    }

    private void criarRestricaoTotalOtimo(
            MPSolver solver,
            MPVariable[] variaveis,
            int zInteiroOtimo
    ) {
        MPConstraint restricao = solver.makeConstraint(
                zInteiroOtimo,
                zInteiroOtimo,
                "total_otimo"
        );

        for (MPVariable variavel : variaveis) {
            restricao.setCoefficient(variavel, 1.0);
        }
    }

    private void criarObjetivoDeProximidade(
            MPSolver solver,
            MPVariable[] variaveis,
            List<ResultadoPadrao> referenciaContinua,
            double infinito
    ) {
        MPObjective objetivo = solver.objective();

        for (int i = 0; i < variaveis.length; i++) {
            double referencia = referenciaContinua.get(i).quantidadeContinua();
            MPVariable desvio = solver.makeNumVar(
                    0.0,
                    infinito,
                    "desvio_" + variaveis[i].name()
            );

            MPConstraint limiteSuperior = solver.makeConstraint(
                    -infinito,
                    referencia,
                    "desvio_superior_" + variaveis[i].name()
            );
            limiteSuperior.setCoefficient(variaveis[i], 1.0);
            limiteSuperior.setCoefficient(desvio, -1.0);

            MPConstraint limiteInferior = solver.makeConstraint(
                    referencia,
                    infinito,
                    "desvio_inferior_" + variaveis[i].name()
            );
            limiteInferior.setCoefficient(variaveis[i], 1.0);
            limiteInferior.setCoefficient(desvio, 1.0);

            objetivo.setCoefficient(desvio, 1.0);
        }

        objetivo.setMinimization();
    }

    private boolean solucaoEncontrada(MPSolver.ResultStatus status) {
        return status == MPSolver.ResultStatus.OPTIMAL
                || status == MPSolver.ResultStatus.FEASIBLE;
    }

    private int[] extrairQuantidades(MPVariable[] variaveis) {
        int[] quantidades = new int[variaveis.length];

        for (int i = 0; i < variaveis.length; i++) {
            quantidades[i] = (int) Math.round(
                    limparErroNumerico(variaveis[i].solutionValue())
            );
        }

        return quantidades;
    }

    private int somar(int[] valores) {
        int total = 0;

        for (int valor : valores) {
            total += valor;
        }

        return total;
    }

    private record SolucaoMip(
            String status,
            int zInteiro,
            int[] quantidades,
            MPVariable[] variaveis
    ) {
        private static SolucaoMip naoEncontrada(String status) {
            return new SolucaoMip(status, 0, new int[0], new MPVariable[0]);
        }

        private boolean encontrada() {
            return variaveis.length > 0;
        }
    }

    private List<ResultadoPadrao> montarResultadoPadroes(
            List<PadraoEscala> padroes,
            int[] quantidades
    ) {
        List<ResultadoPadrao> resultado = new ArrayList<>();

        for (int i = 0; i < padroes.size(); i++) {
            PadraoEscala padrao = padroes.get(i);
            int quantidadeInteira = quantidades[i];

            resultado.add(new ResultadoPadrao(
                    padrao.variavel(),
                    padrao.nome(),
                    quantidadeInteira,
                    quantidadeInteira
            ));
        }

        return resultado;
    }

    private List<ResultadoPadrao> montarResultadoPadroes(
            List<PadraoEscala> padroes,
            MPVariable[] variaveis
    ) {
        return montarResultadoPadroes(
                padroes,
                extrairQuantidades(variaveis)
        );
    }

    private MPVariable[] criarVariaveisInteiras(
            MPSolver solver,
            List<PadraoEscala> padroes,
            double infinito
    ) {
        MPVariable[] variaveis = new MPVariable[padroes.size()];

        for (int i = 0; i < padroes.size(); i++) {
            variaveis[i] = solver.makeIntVar(
                    0.0,
                    infinito,
                    padroes.get(i).variavel()
            );
        }

        return variaveis;
    }

    private void criarRestricoesCobertura(
            MPSolver solver,
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            MPVariable[] variaveis,
            double infinito
    ) {
        for (int indicePeriodo = 0; indicePeriodo < periodos.size(); indicePeriodo++) {
            PeriodoEscala periodo = periodos.get(indicePeriodo);

            MPConstraint restricao = solver.makeConstraint(
                    periodo.demandaMinima(),
                    infinito,
                    "cobertura_" + periodo.nome()
            );

            for (int indicePadrao = 0; indicePadrao < padroes.size(); indicePadrao++) {
                int trabalha = padroes.get(indicePadrao)
                        .trabalhaPorPeriodo()
                        .get(indicePeriodo);

                restricao.setCoefficient(variaveis[indicePadrao], trabalha);
            }
        }
    }

    private void criarFuncaoObjetivo(
            MPSolver solver,
            MPVariable[] variaveis
    ) {
        MPObjective objetivo = solver.objective();

        for (MPVariable variavel : variaveis) {
            objetivo.setCoefficient(variavel, 1.0);
        }

        objetivo.setMinimization();
    }

    private double limparErroNumerico(double valor) {
        if (Math.abs(valor) < EPSILON) {
            return 0.0;
        }

        return valor;
    }
}
