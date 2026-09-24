package com.aimockinterviewer.repository;

import com.aimockinterviewer.entity.Interview;
import com.aimockinterviewer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserOrderByIdDesc(User user);

    List<Interview> findTop20ByUserOrderByIdDesc(User user);
}