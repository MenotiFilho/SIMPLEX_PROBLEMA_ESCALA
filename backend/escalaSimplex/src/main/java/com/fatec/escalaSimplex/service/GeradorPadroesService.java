package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class GeradorPadroesService {

    public List<PadraoEscala> gerar(
            List<PeriodoEscala> periodos,
            RegraTrabalhoFolga regra
    ) {
        List<PeriodoEscala> periodosOrdenados = periodos.stream()
                .filter(PeriodoEscala::ativo)
                .sorted(Comparator.comparingInt(PeriodoEscala::ordem))
                .toList();

        int n = periodosOrdenados.size();
        int tamanhoCiclo = regra.periodosTrabalhados() + regra.periodosFolga();

        int quantidadePadroes = definirQuantidadePadroes(n, tamanhoCiclo, regra.circular());

        List<PadraoEscala> padroes = new ArrayList<>();

        for (int inicioTrabalho = 0; inicioTrabalho < quantidadePadroes; inicioTrabalho++) {
            List<Integer> trabalhaPorPeriodo = gerarVetorTrabalho(
                    n,
                    inicioTrabalho,
                    regra,
                    regra.circular()
            );

            if (naoTrabalhaEmNenhumPeriodo(trabalhaPorPeriodo)) {
                continue;
            }

            String nome = gerarNomePadrao(
                    periodosOrdenados,
                    trabalhaPorPeriodo
            );

            padroes.add(new PadraoEscala(
                    "x" + (inicioTrabalho + 1),
                    nome,
                    trabalhaPorPeriodo
            ));
        }

        return padroes;
    }

    private boolean naoTrabalhaEmNenhumPeriodo(List<Integer> trabalhaPorPeriodo) {
        return trabalhaPorPeriodo.stream().noneMatch(valor -> valor == 1);
    }

    private int definirQuantidadePadroes(
            int quantidadePeriodos,
            int tamanhoCiclo,
            boolean circular
    ) {
        if (!circular) {
            return quantidadePeriodos;
        }

        if (quantidadePeriodos % tamanhoCiclo == 0) {
            return tamanhoCiclo;
        }

        return quantidadePeriodos;
    }

    private List<Integer> gerarVetorTrabalho(
            int quantidadePeriodos,
            int inicioTrabalho,
            RegraTrabalhoFolga regra,
            boolean circular
    ) {
        List<Integer> vetor = new ArrayList<>();

        int tamanhoCiclo = regra.periodosTrabalhados() + regra.periodosFolga();

        for (int indicePeriodo = 0; indicePeriodo < quantidadePeriodos; indicePeriodo++) {
            int deslocamento = circular
                    ? Math.floorMod(indicePeriodo - inicioTrabalho, tamanhoCiclo)
                    : indicePeriodo - inicioTrabalho;

            boolean trabalha = deslocamento >= 0
                    && Math.floorMod(deslocamento, tamanhoCiclo) < regra.periodosTrabalhados();

            vetor.add(trabalha ? 1 : 0);
        }

        return vetor;
    }

    private String gerarNomePadrao(
            List<PeriodoEscala> periodos,
            List<Integer> trabalhaPorPeriodo
    ) {
        List<String> nomesTrabalho = new ArrayList<>();
        int primeiroIndiceTrabalho = encontrarInicioDoBlocoDeTrabalho(trabalhaPorPeriodo);

        if (primeiroIndiceTrabalho < 0) {
            return "";
        }

        for (int deslocamento = 0; deslocamento < periodos.size(); deslocamento++) {
            int indicePeriodo = (primeiroIndiceTrabalho + deslocamento) % periodos.size();

            if (trabalhaPorPeriodo.get(indicePeriodo) == 1) {
                nomesTrabalho.add(periodos.get(indicePeriodo).nome());
            }
        }

        return String.join(", ", nomesTrabalho);
    }

    private int encontrarInicioDoBlocoDeTrabalho(List<Integer> trabalhaPorPeriodo) {
        for (int i = 0; i < trabalhaPorPeriodo.size(); i++) {
            if (trabalhaPorPeriodo.get(i) != 1) {
                continue;
            }

            int indiceAnterior = Math.floorMod(i - 1, trabalhaPorPeriodo.size());
            if (trabalhaPorPeriodo.get(indiceAnterior) == 0) {
                return i;
            }
        }

        return -1;
    }
}
