package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.dto.response.CenarioResponse;
import com.fatec.escalaSimplex.entity.CenarioEntity;
import com.fatec.escalaSimplex.mapper.CenarioMapper;
import com.fatec.escalaSimplex.repository.CenarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        cenarioMapper.atualizarEntity(entity, request);
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
}
