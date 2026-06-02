package com.fatec.escalaSimplex.dto.response;

public record RegraTrabalhoFolgaResponse(
        Long id,
        int periodosTrabalhados,
        int periodosFolga,
        boolean circular
) {
}
