package com.fatec.escalaSimplex.domain;

import java.util.List;

public record CenarioEscala(
        String nome,
        String descricao,
        List<PeriodoEscala> periodos,
        RegraTrabalhoFolga regraTrabalhoFolga
) {
}
