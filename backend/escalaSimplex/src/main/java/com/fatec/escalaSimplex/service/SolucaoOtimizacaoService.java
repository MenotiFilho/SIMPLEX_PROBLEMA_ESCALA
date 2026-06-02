package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.CoberturaPeriodo;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import com.fatec.escalaSimplex.domain.ResultadoPadrao;
import com.fatec.escalaSimplex.entity.CenarioEntity;
import com.fatec.escalaSimplex.entity.SolucaoOtimizacaoEntity;
import com.fatec.escalaSimplex.mapper.CenarioMapper;
import com.fatec.escalaSimplex.repository.CenarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;

@Service
@Profile("!demo & !api-demo")
@RequiredArgsConstructor
public class SolucaoOtimizacaoService {

    private static final String SOLVER_SIMPLEX = "GLOP";

    private final CenarioRepository cenarioRepository;
    private final CenarioMapper cenarioMapper;
    private final EscalaService escalaService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ResultadoOtimizacao resolverOuBuscarSalva(Long cenarioId) {
        CenarioEntity cenarioEntity = buscarCenario(cenarioId);

        if (cenarioEntity.getSolucaoOtimizacao() != null) {
            return toDomain(cenarioEntity.getSolucaoOtimizacao());
        }

        CenarioEscala cenario = cenarioMapper.toDomain(cenarioEntity);
        ResultadoOtimizacao resultado = escalaService.resolver(cenario);

        cenarioEntity.setSolucaoOtimizacao(toEntity(resultado));
        cenarioRepository.saveAndFlush(cenarioEntity);

        return resultado;
    }

    @Transactional(readOnly = true)
    public ResultadoOtimizacao buscarSalva(Long cenarioId) {
        CenarioEntity cenarioEntity = buscarCenario(cenarioId);

        if (cenarioEntity.getSolucaoOtimizacao() == null) {
            throw new EntityNotFoundException("Solução não encontrada para este cenário.");
        }

        return toDomain(cenarioEntity.getSolucaoOtimizacao());
    }

    private CenarioEntity buscarCenario(Long cenarioId) {
        return cenarioRepository.findById(cenarioId)
                .orElseThrow(() -> new EntityNotFoundException("Cenário não encontrado."));
    }

    private SolucaoOtimizacaoEntity toEntity(ResultadoOtimizacao resultado) {
        SolucaoOtimizacaoEntity entity = new SolucaoOtimizacaoEntity();
        entity.setStatus(resultado.status());
        entity.setZContinuo(resultado.zContinuo());
        entity.setZAproximado(resultado.zAproximado());
        entity.setSolver(SOLVER_SIMPLEX);
        entity.setResolvidoEm(Instant.now());
        entity.setPadroesJson(writeJson(resultado.padroes()));
        entity.setCoberturaJson(writeJson(resultado.cobertura()));
        entity.setModeloMatematico(resultado.modeloMatematico());
        return entity;
    }

    private ResultadoOtimizacao toDomain(SolucaoOtimizacaoEntity entity) {
        List<ResultadoPadrao> padroes = readJson(
                entity.getPadroesJson(),
                new TypeReference<>() {
                }
        );

        List<CoberturaPeriodo> cobertura = readJson(
                entity.getCoberturaJson(),
                new TypeReference<>() {
                }
        );

        return new ResultadoOtimizacao(
                entity.getStatus(),
                entity.getZContinuo(),
                entity.getZAproximado(),
                padroes,
                cobertura,
                entity.getModeloMatematico()
        );
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Não foi possível serializar a solução.", exception);
        }
    }

    private <T> T readJson(String value, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(value, typeReference);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Não foi possível ler a solução salva.", exception);
        }
    }
}
