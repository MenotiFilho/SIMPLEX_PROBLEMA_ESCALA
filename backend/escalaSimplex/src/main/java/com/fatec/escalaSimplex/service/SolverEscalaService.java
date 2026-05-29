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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SolverEscalaService {

    private static final double EPSILON = 0.000001;

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

        List<ResultadoPadrao> resultadoPadroes = montarResultadoPadroes(padroes, variaveis);

        List<CoberturaPeriodo> cobertura = calcularCobertura(
                periodosAtivosOrdenados,
                padroes,
                variaveis
        );

        String modeloMatematico = gerarModeloMatematico(periodosAtivosOrdenados, padroes);

        int zAproximado = resultadoPadroes.stream()
                .mapToInt(ResultadoPadrao::quantidadeAproximada)
                .sum();

        return new ResultadoOtimizacao(
                status.name(),
                limparErroNumerico(solver.objective().value()),
                zAproximado,
                resultadoPadroes,
                cobertura,
                modeloMatematico
                 );
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

    private List<CoberturaPeriodo> calcularCobertura(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            MPVariable[] variaveis
    ) {
        List<CoberturaPeriodo> cobertura = new ArrayList<>();

        for (int indicePeriodo = 0; indicePeriodo < periodos.size(); indicePeriodo++) {
            PeriodoEscala periodo = periodos.get(indicePeriodo);

            double atendidosContinuo = 0.0;
            int atendidosAproximado = 0;

            for (int indicePadrao = 0; indicePadrao < padroes.size(); indicePadrao++) {
                int trabalha = padroes.get(indicePadrao)
                        .trabalhaPorPeriodo()
                        .get(indicePeriodo);

                double valorContinuo = limparErroNumerico(variaveis[indicePadrao].solutionValue());
                int valorAproximado = aproximarParaCimaSePositivo(valorContinuo);

                atendidosContinuo += trabalha * valorContinuo;
                atendidosAproximado += trabalha * valorAproximado;
            }

            atendidosContinuo = limparErroNumerico(atendidosContinuo);

            double sobraContinua = limparErroNumerico(
                    atendidosContinuo - periodo.demandaMinima()
            );

            int sobraAproximada = atendidosAproximado - periodo.demandaMinima();

            cobertura.add(new CoberturaPeriodo(
                    periodo.nome(),
                    periodo.demandaMinima(),
                    atendidosContinuo,
                    sobraContinua,
                    atendidosAproximado,
                    sobraAproximada
            ));
        }

        return cobertura;
    }

    private String gerarModeloMatematico(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes
    ) {
        StringBuilder modelo = new StringBuilder();

        modelo.append("Min Z = ");

        for (int i = 0; i < padroes.size(); i++) {
            if (i > 0) {
                modelo.append(" + ");
            }

            modelo.append(padroes.get(i).variavel());
        }

        modelo.append("\n\nSujeito a:\n");

        for (int indicePeriodo = 0; indicePeriodo < periodos.size(); indicePeriodo++) {
            PeriodoEscala periodo = periodos.get(indicePeriodo);

            modelo.append(periodo.nome()).append(": ");

            boolean primeiro = true;

            for (PadraoEscala padrao : padroes) {
                int trabalha = padrao.trabalhaPorPeriodo().get(indicePeriodo);

                if (trabalha == 1) {
                    if (!primeiro) {
                        modelo.append(" + ");
                    }

                    modelo.append(padrao.variavel());
                    primeiro = false;
                }
            }

            modelo.append(" >= ").append(periodo.demandaMinima()).append("\n");
        }

        modelo.append("\n");

        for (PadraoEscala padrao : padroes) {
            modelo.append(padrao.variavel()).append(" >= 0\n");
        }

        return modelo.toString();
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