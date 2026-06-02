package com.fatec.escalaSimplex.controller;

import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.dto.response.CenarioResponse;
import com.fatec.escalaSimplex.service.CenarioCrudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scenarios")
@CrossOrigin(origins = "*")
@Profile("!demo & !api-demo")
@RequiredArgsConstructor
public class EscalaController {

    private final CenarioCrudService cenarioCrudService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CenarioResponse criar(@Valid @RequestBody CenarioRequest request) {
        return cenarioCrudService.criar(request);
    }

    @GetMapping
    public List<CenarioResponse> listar() {
        return cenarioCrudService.listar();
    }

    @GetMapping("/{id}")
    public CenarioResponse buscarPorId(@PathVariable Long id) {
        return cenarioCrudService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public CenarioResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CenarioRequest request
    ) {
        return cenarioCrudService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        cenarioCrudService.deletar(id);
    }
}
