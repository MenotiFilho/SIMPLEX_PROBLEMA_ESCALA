package com.fatec.escalaSimplex.domain;

import java.util.List;

public record PadraoEscala(
        String variavel,
        String nome,
        List<Integer> trabalhaPorPeriodo
) {
}
