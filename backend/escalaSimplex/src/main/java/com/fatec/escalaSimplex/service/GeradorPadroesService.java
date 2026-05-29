package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
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
        int quantidadePadroes = regra.circular()
                ? n
                : n - (regra.periodosTrabalhados() + regra.periodosFolga()) + 1;

        List<PadraoEscala> padroes = new ArrayList<>();

        for (int inicioFolga = 0; inicioFolga < quantidadePadroes; inicioFolga++) {
            List<Integer> trabalhaPorPeriodo = gerarVetorTrabalho(n, inicioFolga, regra);
            String nome = gerarNomePadrao(periodosOrdenados, inicioFolga, regra);

            padroes.add(new PadraoEscala(
                    "x" + (inicioFolga + 1),
                    nome,
                    trabalhaPorPeriodo
            ));
        }

        return padroes;
    }

    private List<Integer> gerarVetorTrabalho(
            int quantidadePeriodos,
            int inicioFolga,
            RegraTrabalhoFolga regra
    ) {
        List<Integer> vetor = new ArrayList<>(Collections.nCopies(quantidadePeriodos, 1));

        for (int i = 0; i < regra.periodosFolga(); i++) {
            int indice = inicioFolga + i;

            if (regra.circular()) {
                indice = indice % quantidadePeriodos;
            }

            if (indice < quantidadePeriodos) {
                vetor.set(indice, 0);
            }
        }

        return vetor;
    }

    private String gerarNomePadrao(
            List<PeriodoEscala> periodos,
            int inicioFolga,
            RegraTrabalhoFolga regra
    ) {
        List<String> nomesFolga = new ArrayList<>();

        for (int i = 0; i < regra.periodosFolga(); i++) {
            int indice = inicioFolga + i;

            if (regra.circular()) {
                indice = indice % periodos.size();
            }

            if (indice < periodos.size()) {
                nomesFolga.add(periodos.get(indice).nome());
            }
        }

        return "Folga " + String.join("-", nomesFolga);
    }
}
