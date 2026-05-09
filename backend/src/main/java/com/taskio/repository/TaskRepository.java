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

    // Kullanıcının panolarındaki tüm görevler
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.board.members m WHERE t.board.owner.id = :userId OR m.user.id = :userId")
    List<Task> findAllTasksByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t LEFT JOIN t.board.members m WHERE (t.board.owner.id = :userId OR m.user.id = :userId) AND t.status = :status")
    int countTasksByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t LEFT JOIN t.board.members m WHERE (t.board.owner.id = :userId OR m.user.id = :userId) AND t.status != :status")
    int countActiveTasksByUserId(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);
}
