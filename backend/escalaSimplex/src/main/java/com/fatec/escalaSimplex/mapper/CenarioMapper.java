package com.fatec.escalaSimplex.mapper;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.dto.request.PeriodoRequest;
import com.fatec.escalaSimplex.dto.response.CenarioResponse;
import com.fatec.escalaSimplex.dto.response.PeriodoResponse;
import com.fatec.escalaSimplex.dto.response.RegraTrabalhoFolgaResponse;
import com.fatec.escalaSimplex.entity.CenarioEntity;
import com.fatec.escalaSimplex.entity.PeriodoEntity;
import com.fatec.escalaSimplex.entity.RegraTrabalhoFolgaEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;
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

    public CenarioEscala toDomain(CenarioEntity entity) {
        List<PeriodoEscala> periodos = entity.getPeriodos()
                .stream()
                .sorted(Comparator.comparingInt(PeriodoEntity::getOrdem))
                .map(periodo -> new PeriodoEscala(
                        periodo.getId(),
                        periodo.getNome(),
                        periodo.getOrdem(),
                        periodo.getDemandaMinima(),
                        periodo.isAtivo()
                ))
                .toList();

        RegraTrabalhoFolgaEntity regraEntity = entity.getRegraTrabalhoFolga();
        RegraTrabalhoFolga regra = new RegraTrabalhoFolga(
                regraEntity.getPeriodosTrabalhados(),
                regraEntity.getPeriodosFolga(),
                regraEntity.isCircular()
        );

        return new CenarioEscala(
                entity.getNome(),
                entity.getDescricao(),
                periodos,
                regra
        );
    }

    public CenarioEntity toEntity(CenarioRequest request) {
        CenarioEntity entity = new CenarioEntity();
        atualizarEntity(entity, request);
        return entity;
    }

    public void atualizarEntity(CenarioEntity entity, CenarioRequest request) {
        entity.setNome(request.nome());
        entity.setDescricao(request.descricao());

        List<PeriodoEntity> periodos = request.periodos()
                .stream()
                .map(this::toPeriodoEntity)
                .toList();

        entity.setPeriodos(periodos);
        atualizarRegraEntity(entity, request);
    }

    public CenarioResponse toResponse(CenarioEntity entity) {
        List<PeriodoResponse> periodos = entity.getPeriodos()
                .stream()
                .sorted(Comparator.comparingInt(PeriodoEntity::getOrdem))
                .map(periodo -> new PeriodoResponse(
                        periodo.getId(),
                        periodo.getNome(),
                        periodo.getOrdem(),
                        periodo.getDemandaMinima(),
                        periodo.isAtivo()
                ))
                .toList();

        RegraTrabalhoFolgaEntity regra = entity.getRegraTrabalhoFolga();
        RegraTrabalhoFolgaResponse regraResponse = new RegraTrabalhoFolgaResponse(
                regra.getId(),
                regra.getPeriodosTrabalhados(),
                regra.getPeriodosFolga(),
                regra.isCircular()
        );

        return new CenarioResponse(
                entity.getId(),
                entity.getNome(),
                entity.getDescricao(),
                periodos,
                regraResponse
        );
    }

    private PeriodoEntity toPeriodoEntity(PeriodoRequest request) {
        PeriodoEntity entity = new PeriodoEntity();
        entity.setNome(request.nome());
        entity.setOrdem(request.ordem());
        entity.setDemandaMinima(request.demandaMinima());
        entity.setAtivo(request.ativo());
        return entity;
    }

    private RegraTrabalhoFolgaEntity toRegraEntity(CenarioRequest request) {
        RegraTrabalhoFolgaEntity entity = new RegraTrabalhoFolgaEntity();
        entity.setPeriodosTrabalhados(request.regraTrabalhoFolga().periodosTrabalhados());
        entity.setPeriodosFolga(request.regraTrabalhoFolga().periodosFolga());
        entity.setCircular(request.regraTrabalhoFolga().circular());
        return entity;
    }

    private void atualizarRegraEntity(CenarioEntity entity, CenarioRequest request) {
        RegraTrabalhoFolgaEntity regra = entity.getRegraTrabalhoFolga();

        if (regra == null) {
            entity.setRegraTrabalhoFolga(toRegraEntity(request));
            return;
        }

        regra.setPeriodosTrabalhados(request.regraTrabalhoFolga().periodosTrabalhados());
        regra.setPeriodosFolga(request.regraTrabalhoFolga().periodosFolga());
        regra.setCircular(request.regraTrabalhoFolga().circular());
    }
}
