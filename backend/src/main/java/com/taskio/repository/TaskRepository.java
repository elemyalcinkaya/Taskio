package com.taskio.repository;

import com.taskio.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBoardId(Long boardId);

    List<Task> findByBoardIdAndStatus(Long boardId, Task.TaskStatus status);

    // Kullanıcıya atanan görevler
    List<Task> findByAssignees_UserId(Long userId);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.assignees a WHERE a.user.id = :userId AND t.status = 'DONE'")
    int countCompletedTasksByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.assignees a WHERE a.user.id = :userId AND t.status != 'DONE'")
    int countActiveTasksByUserId(@Param("userId") Long userId);
}
