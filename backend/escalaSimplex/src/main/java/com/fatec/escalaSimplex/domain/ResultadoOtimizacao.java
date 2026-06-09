package com.fatec.escalaSimplex.domain;

import java.util.List;

public record ResultadoOtimizacao(
        String status,
        int zInteiro,
        List<ResultadoPadrao> padroes,
        List<CoberturaPeriodo> cobertura,
        String modeloMatematico
) {
}
