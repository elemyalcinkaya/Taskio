package com.taskio.repository;

import com.taskio.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    // Kullanıcının sahip olduğu panolar
    List<Board> findByOwnerId(Long ownerId);

    // Kullanıcının üye olduğu tüm panolar (sahip + üye + atandığı görev olan)
    @Query("""
        SELECT b FROM Board b 
        WHERE b.owner.id = :userId 
           OR EXISTS (SELECT m FROM b.members m WHERE m.user.id = :userId)
           OR EXISTS (SELECT t FROM Task t JOIN t.assignees ta WHERE t.board.id = b.id AND ta.user.id = :userId)
        """)
    List<Board> findAllBoardsByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(b) FROM Board b 
        WHERE b.owner.id = :userId 
           OR EXISTS (SELECT m FROM b.members m WHERE m.user.id = :userId)
           OR EXISTS (SELECT t FROM Task t JOIN t.assignees ta WHERE t.board.id = b.id AND ta.user.id = :userId)
        """)
    int countAllBoardsByUserId(@Param("userId") Long userId);
}
