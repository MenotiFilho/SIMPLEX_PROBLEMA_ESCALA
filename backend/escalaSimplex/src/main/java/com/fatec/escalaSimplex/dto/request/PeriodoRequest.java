package com.fatec.escalaSimplex.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PeriodoRequest(
        Long id,

        @NotBlank(message = "O nome do período é obrigatório.")
        String nome,

        @Min(value = 1, message = "A ordem do período deve ser maior ou igual a 1.")
        int ordem,

        @Min(value = 0, message = "A demanda mínima não pode ser negativa.")
        int demandaMinima,

        boolean ativo
) {
}
