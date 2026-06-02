package com.fatec.escalaSimplex.dto.response;

import java.util.List;

public record CenarioResponse(
        Long id,
        String nome,
        String descricao,
        List<PeriodoResponse> periodos,
        RegraTrabalhoFolgaResponse regraTrabalhoFolga
) {
}
