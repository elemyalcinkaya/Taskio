package com.taskio.repository;

import com.taskio.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBoardId(Long boardId);

    List<Task> findByBoardIdAndStatus(Long boardId, Task.TaskStatus status);

    // Kullanıcıya atanan görevler
    List<Task> findByAssignees_UserId(Long userId);
}
