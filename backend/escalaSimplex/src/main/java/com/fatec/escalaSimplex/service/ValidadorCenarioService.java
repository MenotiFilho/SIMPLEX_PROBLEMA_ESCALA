package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValidadorCenarioService {

    public void validar(CenarioEscala cenario) {
        if (cenario == null){
            throw new IllegalArgumentException("Cenario nao pode ser nulo");
        }
        if (cenario.periodos() == null || cenario.periodos().isEmpty()){
            throw new IllegalArgumentException("O cenário deve possuir ao menos um período");
        }

        List<PeriodoEscala> periodosAtivos = cenario.periodos()
                .stream()
                .filter(PeriodoEscala::ativo)
                .toList();

        if (periodosAtivos.isEmpty()){
            throw new IllegalArgumentException("O cenário deve possuir ao menos um período ativo.");
        }

        boolean existeDemandaNegativa = periodosAtivos.stream()
                .anyMatch(periodo -> periodo.demandaMinima() < 0);



        if (existeDemandaNegativa) {
            throw new IllegalArgumentException("A demanda mínima não pode ser negativa.");
        }

        validarOrdensRepetidas(periodosAtivos);
        validarRegra(cenario.regraTrabalhoFolga(), periodosAtivos.size());
    }

    private void validarOrdensRepetidas(List<PeriodoEscala> periodos) {
        long quantidadeOrdensDistintas = periodos.stream()
                .map(PeriodoEscala::ordem)
                .distinct()
                .count();

        if (quantidadeOrdensDistintas != periodos.size()) {
            throw new IllegalArgumentException("As ordens dos períodos não podem se repetir.");
        }
    }

    private void validarRegra(RegraTrabalhoFolga regra, int quantidadePeriodosAtivos) {
        if (regra == null) {
            throw new IllegalArgumentException("A regra de trabalho e folga não pode ser nula.");
        }

        if (regra.periodosTrabalhados() <= 0) {
            throw new IllegalArgumentException("A quantidade de períodos trabalhados deve ser maior que zero.");
        }

        if (regra.periodosFolga() <= 0) {
            throw new IllegalArgumentException("A quantidade de períodos de folga deve ser maior que zero.");
        }

        if (regra.periodosTrabalhados() + regra.periodosFolga() > quantidadePeriodosAtivos) {
            throw new IllegalArgumentException(
                    "A soma entre períodos trabalhados e períodos de folga deve ser menor ou igual ao número de períodos ativos."
            );
        }
    }

}
