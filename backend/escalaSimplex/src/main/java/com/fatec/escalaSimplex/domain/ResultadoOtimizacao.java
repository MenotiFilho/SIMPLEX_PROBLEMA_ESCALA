package com.fatec.escalaSimplex.domain;

import java.util.List;

public record ResultadoOtimizacao(
        String status,
        double zContinuo,
        int zAproximado,
        List<ResultadoPadrao> padroes,
        List<CoberturaPeriodo> cobertura,
        String modeloMatematico
) {
}
