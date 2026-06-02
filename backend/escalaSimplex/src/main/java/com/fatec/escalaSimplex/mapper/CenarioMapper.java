package com.fatec.escalaSimplex.mapper;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CenarioMapper {

    public CenarioEscala toDomain(CenarioRequest request) {
        List<PeriodoEscala> periodos = request.periodos()
                .stream()
                .map(periodo -> new PeriodoEscala(
                        periodo.id(),
                        periodo.nome(),
                        periodo.ordem(),
                        periodo.demandaMinima(),
                        periodo.ativo()
                ))
                .toList();

        RegraTrabalhoFolga regra = new RegraTrabalhoFolga(
                request.regraTrabalhoFolga().periodosTrabalhados(),
                request.regraTrabalhoFolga().periodosFolga(),
                request.regraTrabalhoFolga().circular()
        );

        return new CenarioEscala(
                request.nome(),
                request.descricao(),
                periodos,
                regra
        );
    }
}
