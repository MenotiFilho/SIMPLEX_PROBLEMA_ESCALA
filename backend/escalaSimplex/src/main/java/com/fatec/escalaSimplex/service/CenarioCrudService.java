package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.dto.request.PeriodoRequest;
import com.fatec.escalaSimplex.dto.request.RegraTrabalhoFolgaRequest;
import com.fatec.escalaSimplex.dto.response.CenarioResponse;
import com.fatec.escalaSimplex.entity.CenarioEntity;
import com.fatec.escalaSimplex.entity.PeriodoEntity;
import com.fatec.escalaSimplex.entity.RegraTrabalhoFolgaEntity;
import com.fatec.escalaSimplex.mapper.CenarioMapper;
import com.fatec.escalaSimplex.repository.CenarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Profile("!demo & !api-demo")
@RequiredArgsConstructor
public class CenarioCrudService {

    private final CenarioRepository cenarioRepository;
    private final CenarioMapper cenarioMapper;
    private final ValidadorCenarioService validadorCenarioService;

    @Transactional
    public CenarioResponse criar(CenarioRequest request) {
        validarRequest(request);

        CenarioEntity entity = cenarioMapper.toEntity(request);
        CenarioEntity salvo = cenarioRepository.save(entity);

        return cenarioMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<CenarioResponse> listar() {
        return cenarioRepository.findAll()
                .stream()
                .map(cenarioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CenarioResponse buscarPorId(Long id) {
        CenarioEntity entity = buscarEntityPorId(id);
        return cenarioMapper.toResponse(entity);
    }

    @Transactional
    public CenarioResponse atualizar(Long id, CenarioRequest request) {
        validarRequest(request);

        CenarioEntity entity = buscarEntityPorId(id);
        boolean deveInvalidarSolucao = regraOuPeriodosMudaram(entity, request);

        cenarioMapper.atualizarEntity(entity, request);

        if (deveInvalidarSolucao) {
            entity.setSolucaoOtimizacao(null);
        }

        CenarioEntity atualizado = cenarioRepository.saveAndFlush(entity);

        return cenarioMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        CenarioEntity entity = buscarEntityPorId(id);
        cenarioRepository.delete(entity);
    }

    private CenarioEntity buscarEntityPorId(Long id) {
        return cenarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cenário não encontrado."));
    }

    private void validarRequest(CenarioRequest request) {
        CenarioEscala cenario = cenarioMapper.toDomain(request);
        validadorCenarioService.validar(cenario);
    }

    private boolean regraOuPeriodosMudaram(CenarioEntity entity, CenarioRequest request) {
        return regraMudou(entity.getRegraTrabalhoFolga(), request.regraTrabalhoFolga())
                || periodosMudaram(entity.getPeriodos(), request.periodos());
    }

    private boolean regraMudou(RegraTrabalhoFolgaEntity atual, RegraTrabalhoFolgaRequest nova) {
        if (atual == null || nova == null) {
            return atual != null || nova != null;
        }

        return atual.getPeriodosTrabalhados() != nova.periodosTrabalhados()
                || atual.getPeriodosFolga() != nova.periodosFolga()
                || atual.isCircular() != nova.circular();
    }

    private boolean periodosMudaram(List<PeriodoEntity> atuais, List<PeriodoRequest> novos) {
        List<PeriodoEntity> atuaisOrdenados = atuais.stream()
                .sorted(Comparator.comparingInt(PeriodoEntity::getOrdem))
                .toList();

        List<PeriodoRequest> novosOrdenados = novos.stream()
                .sorted(Comparator.comparingInt(PeriodoRequest::ordem))
                .toList();

        if (atuaisOrdenados.size() != novosOrdenados.size()) {
            return true;
        }

        for (int index = 0; index < atuaisOrdenados.size(); index++) {
            PeriodoEntity atual = atuaisOrdenados.get(index);
            PeriodoRequest novo = novosOrdenados.get(index);

            if (!Objects.equals(atual.getNome(), novo.nome())
                    || atual.getOrdem() != novo.ordem()
                    || atual.getDemandaMinima() != novo.demandaMinima()
                    || atual.isAtivo() != novo.ativo()) {
                return true;
            }
        }

        return false;
    }
}
