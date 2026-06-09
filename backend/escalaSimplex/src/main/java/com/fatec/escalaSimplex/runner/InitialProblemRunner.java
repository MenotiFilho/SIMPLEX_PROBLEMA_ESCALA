package com.fatec.escalaSimplex.runner;

import com.fatec.escalaSimplex.domain.CenarioEscala;
import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import com.fatec.escalaSimplex.domain.ResultadoOtimizacao;
import com.fatec.escalaSimplex.service.EscalaService;
import com.fatec.escalaSimplex.service.SolverEscalaInteiroService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("demo")
@RequiredArgsConstructor
public class InitialProblemRunner implements CommandLineRunner {

    private final EscalaService escalaService;
    private final SolverEscalaInteiroService solverEscalaInteiroService;

    @Override
    public void run(String @NonNull ... args) {
        CenarioEscala cenario = criarCenarioLclOriginal();
        //CenarioEscala cenario = criarCenario12x36();

        List<PadraoEscala> padroes = escalaService.preVisualizarPadroes(cenario);

        imprimirPadroes(padroes);

        ResultadoOtimizacao resultadoContinuo = escalaService.resolver(cenario);
        ResultadoOtimizacao resultadoInteiro = solverEscalaInteiroService.resolver(cenario, padroes);

        System.out.println("\n=== RESULTADO CONTÍNUO - SIMPLEX/GLOP ===");
        imprimirResultadoContinuo(resultadoContinuo);

        System.out.println("\n=== RESULTADO INTEIRO - MIP/SCIP ===");
        imprimirResultadoInteiro(resultadoInteiro);
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

    private void imprimirResultadoContinuo(ResultadoOtimizacao resultado) {
        System.out.println("\nStatus: " + resultado.status());

        System.out.println("Z inteiro: " + resultado.zInteiro());

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

    private void imprimirResultadoInteiro(ResultadoOtimizacao resultado) {
        System.out.println("\nStatus: " + resultado.status());

        System.out.println("Z inteiro: " + resultado.zInteiro());

        System.out.println("\nQuantidade por padrão:");
        resultado.padroes().forEach(padrao ->
                System.out.printf(
                        "%s | %s | quantidade=%d%n",
                        padrao.variavel(),
                        padrao.nome(),
                        padrao.quantidadeAproximada()
                )
        );

        System.out.println("\nCobertura:");
        resultado.cobertura().forEach(cobertura ->
                System.out.printf(
                        "%s | demanda=%d | atendidos=%d | sobra=%d%n",
                        cobertura.periodo(),
                        cobertura.demandaMinima(),
                        cobertura.atendidosAproximado(),
                        cobertura.sobraAproximada()
                )
        );

        System.out.println("\nModelo matemático:");
        System.out.println(resultado.modeloMatematico());
    }
    private CenarioEscala criarCenario12x36() {
        return new CenarioEscala(
                "Escala 12x36 - exemplo",
                "Cenário com períodos de 12 horas em escala 12x36.",
                List.of(
                        new PeriodoEscala(1L, "Segunda 07h-19h", 1, 4, true),
                        new PeriodoEscala(2L, "Segunda 19h-07h", 2, 2, true),

                        new PeriodoEscala(3L, "Terça 07h-19h", 3, 5, true),
                        new PeriodoEscala(4L, "Terça 19h-07h", 4, 2, true),

                        new PeriodoEscala(5L, "Quarta 07h-19h", 5, 4, true),
                        new PeriodoEscala(6L, "Quarta 19h-07h", 6, 3, true),

                        new PeriodoEscala(7L, "Quinta 07h-19h", 7, 5, true),
                        new PeriodoEscala(8L, "Quinta 19h-07h", 8, 2, true)
                ),
                new RegraTrabalhoFolga(1, 3, true)
        );
    }
}
