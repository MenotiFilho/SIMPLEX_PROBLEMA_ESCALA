package com.fatec.escalaSimplex.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cenarios")
@Getter
@NoArgsConstructor
public class CenarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter
    private Long id;

    @Column(nullable = false)
    @Setter
    private String nome;

    @Column(length = 1000)
    @Setter
    private String descricao;

    @OneToMany(mappedBy = "cenario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PeriodoEntity> periodos = new ArrayList<>();

    @OneToOne(mappedBy = "cenario", cascade = CascadeType.ALL, orphanRemoval = true)
    private RegraTrabalhoFolgaEntity regraTrabalhoFolga;

    public void setPeriodos(List<PeriodoEntity> periodos) {
        this.periodos.clear();

        if (periodos != null) {
            periodos.forEach(this::addPeriodo);
        }
    }

    public void setRegraTrabalhoFolga(RegraTrabalhoFolgaEntity regraTrabalhoFolga) {
        if (this.regraTrabalhoFolga != null) {
            this.regraTrabalhoFolga.setCenario(null);
        }

        this.regraTrabalhoFolga = regraTrabalhoFolga;

        if (regraTrabalhoFolga != null) {
            regraTrabalhoFolga.setCenario(this);
        }
    }

    public void addPeriodo(PeriodoEntity periodo) {
        periodos.add(periodo);
        periodo.setCenario(this);
    }
}
