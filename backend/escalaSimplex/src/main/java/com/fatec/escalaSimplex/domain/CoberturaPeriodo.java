package com.fatec.escalaSimplex.domain;

public record CoberturaPeriodo(
        String periodo,
        int demandaMinima,
        double atendidosContinuo,
        double sobraContinua,
        int atendidosAproximado,
        int sobraAproximada
) {
}
