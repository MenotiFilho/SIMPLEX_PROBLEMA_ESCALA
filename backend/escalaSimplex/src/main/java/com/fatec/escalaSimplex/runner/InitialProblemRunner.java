package com.fatec.escalaSimplex.runner;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import com.fatec.escalaSimplex.service.GeradorPadroesService;
import com.fatec.escalaSimplex.service.SolverEscalaService;
import com.fatec.escalaSimplex.service.ValidadorCenarioService;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InitialProblemRunner implements CommandLineRunner {

    private final ValidadorCenarioService validadorCenarioService;
    private final GeradorPadroesService geradorPadroesService;
    private final SolverEscalaService solverEscalaService;

    public InitialProblemRunner(
            ValidadorCenarioService validadorCenarioService,
            GeradorPadroesService geradorPadroesService,
            SolverEscalaService solverEscalaService
    ) {
        this.validadorCenarioService = validadorCenarioService;
        this.geradorPadroesService = geradorPadroesService;
        this.solverEscalaService = solverEscalaService;
    }

    @Override
    public void run(String @NonNull ... args) {
        CenarioEscala cenario = criarCenarioLclOriginal();

        validadorCenarioService.validar(cenario);

        List<PadraoEscala> padroes = geradorPadroesService.gerar(
                cenario.periodos(),
                cenario.regraTrabalhoFolga()
        );

        imprimirPadroes(padroes);

        ResultadoOtimizacao resultado = solverEscalaService.resolver(cenario, padroes);

        imprimirResultado(resultado);
    }

    private CenarioEscala criarCenarioLclOriginal() {
        return new CenarioEscala(
                "Problema LCL original",
                "Cenário base com 7 períodos, 5 trabalhados e 2 de folga.",
                List.of(
                        new PeriodoEscala(1L, "Segunda", 1, 18, true),
                        new PeriodoEscala(2L, "Terça", 2, 12, true),
                        new PeriodoEscala(3L, "Quarta", 3, 15, true),
                        new PeriodoEscala(4L, "Quinta", 4, 19, true),
                        new PeriodoEscala(5L, "Sexta", 5, 14, true),
                        new PeriodoEscala(6L, "Sábado", 6, 16, true),
                        new PeriodoEscala(7L, "Domingo", 7, 11, true)
                ),
                new RegraTrabalhoFolga(5, 2, true)
        );
    }

    private void imprimirPadroes(List<PadraoEscala> padroes) {
        System.out.println("\nPadrões gerados:");

        for (PadraoEscala padrao : padroes) {
            System.out.println(
                    padrao.variavel() + " | " +
                            padrao.nome() + " | " +
                            padrao.trabalhaPorPeriodo()
            );
        }
    }

    private void imprimirResultado(ResultadoOtimizacao resultado) {
        System.out.println("\nStatus: " + resultado.status());

        System.out.printf("Z contínuo: %.2f%n", resultado.zContinuo());
        System.out.println("Z aproximado: " + resultado.zAproximado());

        System.out.println("\nQuantidade por padrão:");
        resultado.padroes().forEach(padrao ->
                System.out.printf(
                        "%s | %s | contínuo=%.2f | aproximado=%d%n",
                        padrao.variavel(),
                        padrao.nome(),
                        padrao.quantidadeContinua(),
                        padrao.quantidadeAproximada()
                )
        );

        System.out.println("\nCobertura:");
        resultado.cobertura().forEach(cobertura ->
                System.out.printf(
                        "%s | demanda=%d | atendidos contínuo=%.2f | sobra contínua=%.2f | atendidos aproximado=%d | sobra aproximada=%d%n",
                        cobertura.periodo(),
                        cobertura.demandaMinima(),
                        cobertura.atendidosContinuo(),
                        cobertura.sobraContinua(),
                        cobertura.atendidosAproximado(),
                        cobertura.sobraAproximada()
                )
        );

        System.out.println("\nModelo matemático:");
        System.out.println(resultado.modeloMatematico());
    }
}