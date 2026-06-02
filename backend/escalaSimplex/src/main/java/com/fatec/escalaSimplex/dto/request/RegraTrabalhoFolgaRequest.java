package com.fatec.escalaSimplex.dto.request;

import jakarta.validation.constraints.Min;

public record RegraTrabalhoFolgaRequest(
        @Min(value = 1, message = "A quantidade de períodos trabalhados deve ser maior que zero.")
        int periodosTrabalhados,

        @Min(value = 1, message = "A quantidade de períodos de folga deve ser maior que zero.")
        int periodosFolga,

        boolean circular
) {
}
