package com.taskio.repository;

import com.taskio.entity.Follow;
import com.taskio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // Kabul edilmiş takip edilen kullanıcılar (görev atama için)
    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId AND f.status = 'ACCEPTED'")
    List<User> findAcceptedFollowingByUserId(@Param("userId") Long userId);

    // Kabul edilmiş takipçiler
    @Query("SELECT f.follower FROM Follow f WHERE f.following.id = :userId AND f.status = 'ACCEPTED'")
    List<User> findAcceptedFollowersByUserId(@Param("userId") Long userId);

    // Bekleyen gelen istekler (onay bekliyorum)
    @Query("SELECT f FROM Follow f WHERE f.following.id = :userId AND f.status = 'PENDING'")
    List<Follow> findPendingRequestsForUser(@Param("userId") Long userId);

    // Belirli bir followId ile gelen istek
    Optional<Follow> findByIdAndFollowingId(Long id, Long followingId);
}
