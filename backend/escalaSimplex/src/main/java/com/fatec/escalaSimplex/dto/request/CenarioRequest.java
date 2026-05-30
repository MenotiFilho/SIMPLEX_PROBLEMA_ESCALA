package com.fatec.escalaSimplex.dto.request;

import java.util.List;

public record CenarioRequest(
        String nome,
        String descricao,
        List<PeriodoRequest> periodos,
        RegraTrabalhoFolgaRequest regraTrabalhoFolga
) {
}
