package com.fatec.escalaSimplex.controller;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.mapper.CenarioMapper;
import com.fatec.escalaSimplex.service.EscalaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scenarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EscalaResolucaoController {

    private final EscalaService escalaService;
    private final CenarioMapper cenarioMapper;

    @PostMapping("/patterns/preview")
    public List<PadraoEscala> preVisualizarPadroes(@Valid @RequestBody CenarioRequest request) {
        CenarioEscala cenario = cenarioMapper.toDomain(request);
        return escalaService.preVisualizarPadroes(cenario);
    }

    @PostMapping("/solve")
    public ResultadoOtimizacao resolver(@Valid @RequestBody CenarioRequest request) {
        CenarioEscala cenario = cenarioMapper.toDomain(request);
        return escalaService.resolver(cenario);
    }
}
