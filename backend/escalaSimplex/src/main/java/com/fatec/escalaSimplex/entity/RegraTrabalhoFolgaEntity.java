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

@Entity
@Table(name = "regras_trabalho_folga")
@Getter
@Setter
@NoArgsConstructor
public class RegraTrabalhoFolgaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int periodosTrabalhados;

    @Column(nullable = false)
    private int periodosFolga;

    @Column(nullable = false)
    private boolean circular;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cenario_id", nullable = false, unique = true)
    private CenarioEntity cenario;
}
