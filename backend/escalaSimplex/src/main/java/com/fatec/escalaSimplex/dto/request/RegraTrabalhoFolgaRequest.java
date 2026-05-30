package com.fatec.escalaSimplex.dto.request;

public record RegraTrabalhoFolgaRequest(
        int periodosTrabalhados,
        int periodosFolga,
        boolean circular
) {
}
