package com.fatec.escalaSimplex.domain;

public record RegraTrabalhoFolga(
        int periodosTrabalhados,
        int periodosFolga,
        boolean circular
) {}
