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

    // Kullanıcının üye olduğu tüm panolar (sahip + üye)
    @Query("SELECT b FROM Board b LEFT JOIN b.members m WHERE b.owner.id = :userId OR m.user.id = :userId")
    List<Board> findAllBoardsByUserId(@Param("userId") Long userId);
}
