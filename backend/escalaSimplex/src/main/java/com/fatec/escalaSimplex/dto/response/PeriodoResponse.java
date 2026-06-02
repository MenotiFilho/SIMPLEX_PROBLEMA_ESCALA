package com.fatec.escalaSimplex.dto.response;

public record PeriodoResponse(
        Long id,
        String nome,
        int ordem,
        int demandaMinima,
        boolean ativo
) {
}
