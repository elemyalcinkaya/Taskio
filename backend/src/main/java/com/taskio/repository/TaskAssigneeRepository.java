package com.taskio.repository;

import com.taskio.entity.TaskAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, Long> {
    List<TaskAssignee> findByTaskId(Long taskId);
    boolean existsByTaskIdAndUserId(Long taskId, Long userId);
    void deleteByTaskIdAndUserId(Long taskId, Long userId);
}
