package com.fatec.escalaSimplex.dto.request;

public record PeriodoRequest(
        Long id,
        String nome,
        int ordem,
        int demandaMinima,
        boolean ativo
) {
}
