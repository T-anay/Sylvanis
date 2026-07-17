package com.yangin.backend.repository;

import com.yangin.backend.model.FireIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FireIncidentRepository extends JpaRepository<FireIncident, Long> {
}
