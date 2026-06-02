package com.fatec.escalaSimplex.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "solucoes_otimizacao")
@Getter
@Setter
@NoArgsConstructor
public class SolucaoOtimizacaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private double zContinuo;

    @Column(nullable = false)
    private int zAproximado;

    @Column(nullable = false)
    private String solver;

    @Column(nullable = false)
    private Instant resolvidoEm;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String padroesJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String coberturaJson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String modeloMatematico;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cenario_id", nullable = false, unique = true)
    private CenarioEntity cenario;
}
