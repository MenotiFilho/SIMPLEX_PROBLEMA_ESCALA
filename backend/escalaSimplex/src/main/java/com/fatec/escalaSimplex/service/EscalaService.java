package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EscalaService {

    private final ValidadorCenarioService validadorCenarioService;
    private final GeradorPadroesService geradorPadroesService;
    private final SolverEscalaService solverEscalaService;

    public List<PadraoEscala> preVisualizarPadroes(CenarioEscala cenario) {
        validadorCenarioService.validar(cenario);

        return geradorPadroesService.gerar(
                cenario.periodos(),
                cenario.regraTrabalhoFolga()
        );
    }

    public ResultadoOtimizacao resolver(CenarioEscala cenario) {
        validadorCenarioService.validar(cenario);

        List<PadraoEscala> padroes = geradorPadroesService.gerar(
                cenario.periodos(),
                cenario.regraTrabalhoFolga()
        );

        return solverEscalaService.resolver(cenario, padroes);
    }
}
