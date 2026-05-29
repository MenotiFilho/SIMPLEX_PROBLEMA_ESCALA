package com.fatec.escalaSimplex.domain;

public record PeriodoEscala(
        Long id,
        String nome,
        int ordem,
        int demandaMinima,
        boolean ativo
) {
}
