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

    // Kullanıcının panolarındaki tüm görevler + başka panolardan atandığı görevler
    @Query("""
        SELECT t FROM Task t
        WHERE t.board.owner.id = :userId
           OR EXISTS (SELECT m FROM t.board.members m WHERE m.user.id = :userId)
           OR EXISTS (SELECT ta FROM t.assignees ta WHERE ta.user.id = :userId)
        """)
    List<Task> findAllTasksByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(t) FROM Task t
        WHERE (t.board.owner.id = :userId
               OR EXISTS (SELECT m FROM t.board.members m WHERE m.user.id = :userId)
               OR EXISTS (SELECT ta FROM t.assignees ta WHERE ta.user.id = :userId))
          AND t.status = :status
        """)
    int countTasksByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);

    @Query("""
        SELECT COUNT(t) FROM Task t
        WHERE (t.board.owner.id = :userId
               OR EXISTS (SELECT m FROM t.board.members m WHERE m.user.id = :userId)
               OR EXISTS (SELECT ta FROM t.assignees ta WHERE ta.user.id = :userId))
          AND t.status != :status
        """)
    int countActiveTasksByUserId(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);
}
