package com.fatec.escalaSimplex.service;

import com.fatec.escalaSimplex.domain.PadraoEscala;
import com.fatec.escalaSimplex.domain.PeriodoEscala;
import com.fatec.escalaSimplex.domain.RegraTrabalhoFolga;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GeradorPadroesServiceTest {

    private final GeradorPadroesService service = new GeradorPadroesService();

    @Test
    void deveRotacionarONomeDoPadraoParaComecarNoPrimeiroDiaTrabalhado() {
        List<PeriodoEscala> periodos = List.of(
                new PeriodoEscala(1L, "Domingo", 1, 11, true),
                new PeriodoEscala(2L, "Segunda", 2, 18, true),
                new PeriodoEscala(3L, "Terça", 3, 12, true),
                new PeriodoEscala(4L, "Quarta", 4, 15, true),
                new PeriodoEscala(5L, "Quinta", 5, 19, true),
                new PeriodoEscala(6L, "Sexta", 6, 14, true),
                new PeriodoEscala(7L, "Sábado", 7, 16, true)
        );

        List<PadraoEscala> padroes = service.gerar(periodos, new RegraTrabalhoFolga(5, 2, true));

        assertEquals("Domingo, Segunda, Terça, Quarta, Quinta", padroes.get(0).nome());
        assertEquals("Segunda, Terça, Quarta, Quinta, Sexta", padroes.get(1).nome());
        assertEquals("Terça, Quarta, Quinta, Sexta, Sábado", padroes.get(2).nome());
        assertEquals("Quarta, Quinta, Sexta, Sábado, Domingo", padroes.get(3).nome());
        assertEquals("Quinta, Sexta, Sábado, Domingo, Segunda", padroes.get(4).nome());
        assertEquals("Sexta, Sábado, Domingo, Segunda, Terça", padroes.get(5).nome());
        assertEquals("Sábado, Domingo, Segunda, Terça, Quarta", padroes.get(6).nome());
    }
}
