package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CoberturaPeriodo;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.google.ortools.linearsolver.MPVariable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CoberturaService {

    private static final double EPSILON = 0.000001;

    public List<CoberturaPeriodo> calcularContinua(
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

    public List<CoberturaPeriodo> calcularInteira(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            MPVariable[] variaveis
    ) {
        List<CoberturaPeriodo> cobertura = new ArrayList<>();

        for (int indicePeriodo = 0; indicePeriodo < periodos.size(); indicePeriodo++) {
            PeriodoEscala periodo = periodos.get(indicePeriodo);

            int atendidos = 0;

            for (int indicePadrao = 0; indicePadrao < padroes.size(); indicePadrao++) {
                int trabalha = padroes.get(indicePadrao)
                        .trabalhaPorPeriodo()
                        .get(indicePeriodo);

                int quantidadeInteira = (int) Math.round(
                        limparErroNumerico(variaveis[indicePadrao].solutionValue())
                );

                atendidos += trabalha * quantidadeInteira;
            }

            int sobra = atendidos - periodo.demandaMinima();

            cobertura.add(new CoberturaPeriodo(
                    periodo.nome(),
                    periodo.demandaMinima(),
                    atendidos,
                    sobra,
                    atendidos,
                    sobra
            ));
        }

        return cobertura;
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
