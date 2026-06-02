package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModeloMatematicoService {

    public String gerarContinuo(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes
    ) {
        return gerar(periodos, padroes, false);
    }

    public String gerarInteiro(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes
    ) {
        return gerar(periodos, padroes, true);
    }

    private String gerar(
            List<PeriodoEscala> periodos,
            List<PadraoEscala> padroes,
            boolean inteiro
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
            modelo.append(padrao.variavel());

            if (inteiro) {
                modelo.append(" inteiro");
            }

            modelo.append(" >= 0\n");
        }

        return modelo.toString();
    }
}
