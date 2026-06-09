package com.fatec.escalaSimplex.runner;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!demo & !api-demo")
@Order(1)
@RequiredArgsConstructor
public class DatabaseMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        migrarZInteiro();
    }

    private void migrarZInteiro() {
        boolean tabelaExiste = colunaExiste("solucoes_otimizacao", "id");

        if (!tabelaExiste) {
            return;
        }

        if (!colunaExiste("solucoes_otimizacao", "z_inteiro")
                && colunaExiste("solucoes_otimizacao", "z_aproximado")) {
            jdbcTemplate.execute("alter table solucoes_otimizacao rename column z_aproximado to z_inteiro");
        }

        if (colunaExiste("solucoes_otimizacao", "z_continuo")) {
            jdbcTemplate.execute("alter table solucoes_otimizacao drop column z_continuo");
        }
    }

    private boolean colunaExiste(String tabela, String coluna) {
        Integer quantidade = jdbcTemplate.queryForObject(
                """
                select count(*)
                from information_schema.columns
                where table_schema = current_schema()
                  and table_name = ?
                  and column_name = ?
                """,
                Integer.class,
                tabela,
                coluna
        );

        return quantidade != null && quantidade > 0;
    }
}
