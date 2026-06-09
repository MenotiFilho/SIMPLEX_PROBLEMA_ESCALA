package com.fatec.escalaSimplex.repository;

import com.fatec.escalaSimplex.entity.CenarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CenarioRepository extends JpaRepository<CenarioEntity, Long> {

    boolean existsByNome(String nome);
}
