package com.fatec.escalaSimplex.runner;

import com.fatec.escalaSimplex.dto.request.CenarioRequest;
import com.fatec.escalaSimplex.dto.request.PeriodoRequest;
import com.fatec.escalaSimplex.dto.request.RegraTrabalhoFolgaRequest;
import com.fatec.escalaSimplex.repository.CenarioRepository;
import com.fatec.escalaSimplex.service.CenarioCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("!demo & !api-demo")
@Order(2)
@RequiredArgsConstructor
public class CenariosSeedRunner implements ApplicationRunner {

    private final CenarioCrudService cenarioCrudService;
    private final CenarioRepository cenarioRepository;

    @Override
    public void run(ApplicationArguments args) {
        criarSeNaoExistir(criarCenarioBase5x2());
        criarSeNaoExistir(criarCenario12x36());
        criarSeNaoExistir(criarCenario6x1());
        criarSeNaoExistir(criarCenarioCampanhaNaoCircular());
    }

    private void criarSeNaoExistir(CenarioRequest request) {
        if (!cenarioRepository.existsByNome(request.nome())) {
            cenarioCrudService.criar(request);
        }
    }

    private CenarioRequest criarCenarioBase5x2() {
        return new CenarioRequest(
                "Caso teste - Base 5x2",
                "Cenário base da documentação: 7 períodos, 5 trabalhados e 2 de folga.",
                List.of(
                        periodo("Domingo", 1, 11),
                        periodo("Segunda", 2, 18),
                        periodo("Terça", 3, 12),
                        periodo("Quarta", 4, 15),
                        periodo("Quinta", 5, 19),
                        periodo("Sexta", 6, 14),
                        periodo("Sábado", 7, 16)
                ),
                new RegraTrabalhoFolgaRequest(5, 2, true)
        );
    }

    private CenarioRequest criarCenario12x36() {
        return new CenarioRequest(
                "Caso teste - Escala 12x36",
                "Cenário com turnos de 12 horas em ciclo 12x36.",
                List.of(
                        periodo("Domingo 07h-19h", 1, 2),
                        periodo("Domingo 19h-07h", 2, 2),
                        periodo("Segunda 07h-19h", 3, 4),
                        periodo("Segunda 19h-07h", 4, 2),
                        periodo("Terça 07h-19h", 5, 5),
                        periodo("Terça 19h-07h", 6, 2),
                        periodo("Quarta 07h-19h", 7, 4),
                        periodo("Quarta 19h-07h", 8, 3)
                ),
                new RegraTrabalhoFolgaRequest(1, 3, true)
        );
    }

    private CenarioRequest criarCenario6x1() {
        return new CenarioRequest(
                "Caso teste - Operação 6x1",
                "Cenário semanal para operação com seis períodos trabalhados e um de folga.",
                List.of(
                        periodo("Domingo", 1, 8),
                        periodo("Segunda", 2, 10),
                        periodo("Terça", 3, 10),
                        periodo("Quarta", 4, 12),
                        periodo("Quinta", 5, 12),
                        periodo("Sexta", 6, 14),
                        periodo("Sábado", 7, 16)
                ),
                new RegraTrabalhoFolgaRequest(6, 1, true)
        );
    }

    private CenarioRequest criarCenarioCampanhaNaoCircular() {
        return new CenarioRequest(
                "Caso teste - Campanha temporária 4x2",
                "Janela finita de 10 dias para campanha temporária. Não circular porque o ciclo não precisa fechar no fim do horizonte.",
                List.of(
                        periodo("Dia 1", 1, 6),
                        periodo("Dia 2", 2, 7),
                        periodo("Dia 3", 3, 8),
                        periodo("Dia 4", 4, 8),
                        periodo("Dia 5", 5, 9),
                        periodo("Dia 6", 6, 7),
                        periodo("Dia 7", 7, 6),
                        periodo("Dia 8", 8, 8),
                        periodo("Dia 9", 9, 9),
                        periodo("Dia 10", 10, 5)
                ),
                new RegraTrabalhoFolgaRequest(4, 2, false)
        );
    }

    private PeriodoRequest periodo(String nome, int ordem, int demandaMinima) {
        return new PeriodoRequest(null, nome, ordem, demandaMinima, true);
    }
}
