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
public class SolverEscalaService {

    private static final double EPSILON = 0.000001;

    private final CoberturaService coberturaService;
    private final ModeloMatematicoService modeloMatematicoService;

    public ResultadoOtimizacao resolver(
            CenarioEscala cenario,
            List<PadraoEscala> padroes
    ) {
        Loader.loadNativeLibraries();

        MPSolver solver = MPSolver.createSolver("GLOP");

        if (solver == null) {
            throw new IllegalStateException("Não foi possível criar o solver GLOP.");
        }

        List<PeriodoEscala> periodosAtivosOrdenados = cenario.periodos()
                .stream()
                .filter(PeriodoEscala::ativo)
                .sorted(Comparator.comparingInt(PeriodoEscala::ordem))
                .toList();

        double infinito = MPSolver.infinity();

        MPVariable[] variaveis = criarVariaveis(solver, padroes, infinito);

        criarRestricoesCobertura(
                solver,
                periodosAtivosOrdenados,
                padroes,
                variaveis,
                infinito
        );

        criarFuncaoObjetivo(solver, variaveis);

        MPSolver.ResultStatus status = solver.solve();

        if (status != MPSolver.ResultStatus.OPTIMAL) {
            return new ResultadoOtimizacao(
                    status.name(),
                    0.0,
                    0,
                    List.of(),
                    List.of(),
                    "O solver não encontrou solução ótima."
            );
        }

        MPVariable[] variaveisFinais = desempatarMaximizandoPrimeiroPeriodo(
                periodosAtivosOrdenados,
                padroes,
                calcularZContinuo(variaveis),
                infinito
        );

        if (variaveisFinais.length == 0) {
            variaveisFinais = variaveis;
        }

        List<ResultadoPadrao> resultadoPadroes = montarResultadoPadroes(padroes, variaveisFinais);

        List<CoberturaPeriodo> cobertura = coberturaService.calcularContinua(
                periodosAtivosOrdenados,
                padroes,
                variaveisFinais
        );

        String modeloMatematico = modeloMatematicoService.gerarContinuo(
                periodosAtivosOrdenados,
                padroes
        );

        double zContinuo = calcularZContinuo(variaveisFinais);

        int zInteiro = resultadoPadroes.stream()
                .mapToInt(ResultadoPadrao::quantidadeAproximada)
                .sum();

        return new ResultadoOtimizacao(
                status.name(),
                zContinuo,
                zInteiro,
                resultadoPadroes,
                cobertura,
                modeloMatematico
                 );
    }

    private MPVariable[] desempatarMaximizandoPrimeiroPeriodo(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            double zOtimo,
            double infinito
    ) {
        if (periodos.isEmpty()) {
            return new MPVariable[0];
        }

        MPSolver solver = MPSolver.createSolver("GLOP");

        if (solver == null) {
            return new MPVariable[0];
        }

        MPVariable[] variaveis = criarVariaveis(solver, padroes, infinito);

        criarRestricoesCobertura(
                solver,
                periodos,
                padroes,
                variaveis,
                infinito
        );

        MPConstraint totalOtimo = solver.makeConstraint(
                zOtimo - EPSILON,
                zOtimo + EPSILON,
                "total_otimo"
        );

        for (MPVariable variavel : variaveis) {
            totalOtimo.setCoefficient(variavel, 1.0);
        }

        MPObjective objetivo = solver.objective();

        for (int indicePadrao = 0; indicePadrao < padroes.size(); indicePadrao++) {
            int trabalha = padroes.get(indicePadrao)
                    .trabalhaPorPeriodo()
                    .get(0);
            objetivo.setCoefficient(variaveis[indicePadrao], trabalha);
        }

        objetivo.setMaximization();

        MPSolver.ResultStatus status = solver.solve();

        if (status != MPSolver.ResultStatus.OPTIMAL) {
            return new MPVariable[0];
        }

        return variaveis;
    }

    private double calcularZContinuo(MPVariable[] variaveis) {
        double total = 0.0;

        for (MPVariable variavel : variaveis) {
            total += limparErroNumerico(variavel.solutionValue());
        }

        return limparErroNumerico(total);
    }

    private MPVariable[] criarVariaveis(
            MPSolver solver,
            List<PadraoEscala> padroes,
            double infinito
    ) {
        MPVariable[] variaveis = new MPVariable[padroes.size()];

        for (int i = 0; i < padroes.size(); i++) {
            variaveis[i] = solver.makeNumVar(
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

    private List<ResultadoPadrao> montarResultadoPadroes(
            List<PadraoEscala> padroes,
            MPVariable[] variaveis
    ) {
        List<ResultadoPadrao> resultado = new ArrayList<>();

        for (int i = 0; i < padroes.size(); i++) {
            PadraoEscala padrao = padroes.get(i);

            double quantidadeContinua = limparErroNumerico(variaveis[i].solutionValue());
            int quantidadeAproximada = aproximarParaCimaSePositivo(quantidadeContinua);

            resultado.add(new ResultadoPadrao(
                    padrao.variavel(),
                    padrao.nome(),
                    quantidadeContinua,
                    quantidadeAproximada
            ));
        }

        return resultado;
    }

    private int aproximarParaCimaSePositivo(double valor) {
        if (valor <= EPSILON) {
            return 0;
        }

        return (int) Math.ceil(valor);
    }

    private double limparErroNumerico(double valor) {
        if (Math.abs(valor) < EPSILON) {
            return 0.0;
        }

        return valor;
    }
}
