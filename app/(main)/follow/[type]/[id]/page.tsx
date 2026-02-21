"use client";

import { FollowersList } from "@/components/profile/FollowersList";
import { LIMIT } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/useAuth";
import { SearchResult } from "@/lib/hooks/useSearch";
import { apiService } from "@/lib/services/api";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export default function Follows() {
  const params = useParams<{ type: string; id: string }>();
  const { type, id } = params;

  const { user } = useAuth();
  const [users, setUsers] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false); // prevents infinite calls
  const pageRef = useRef(0);

  // Production fetch
  const fetchUsers = useCallback(
    async (offSet: number, isLoadMore = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        setIsLoading(true);

        let response;

        if (type === "followers") {
          response = await apiService.getFollowers(id, offSet, LIMIT);
        } else if (type === "following") {
          response = await apiService.getFollowing(id, offSet, LIMIT);
        } else {
          toast.error("Invalid follow type");
          return;
        }

        if (response.data?.success) {
          const data = response.data.data;

          setHasMore(data.hasMore);

          const newUsers = data.content || [];

          setUsers((prev) => [...prev, ...newUsers]);
          setPage((prev) => prev + 1);
        } else {
          toast.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Feed fetch error:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [setHasMore, setIsLoading, setUsers],
  );

  // Initial load
  useEffect(() => {
    pageRef.current = 0;
    setUsers([]);
    setHasMore(true);

    fetchUsers(0, false);
    return () => {};
  }, [fetchUsers]);

  // Production Infinite Scroll
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          !isLoading &&
          !fetchingRef.current &&
          hasMore
        ) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          fetchUsers(nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: "50px",
        threshold: 0,
      },
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [hasMore, isLoading, fetchUsers]);

  const handleFollowChange = async (userId: string, isFollowing: boolean) => {
    try {
      console.log(userId);

      if (isFollowing) {
        await apiService.unfollowUser(userId);
      } else {
        await apiService.followUser(userId);
      }

      if (params.id === String(user.id) && params.type === "following") {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  following: !user.following,
                  followerCount: user.following
                    ? user.followerCount - 1
                    : user.followerCount + 1,
                }
              : user,
          ),
        );
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  return (
    <FollowersList
      user={user}
      followers={users}
      isLoading={isLoading}
      onFollowChange={handleFollowChange}
    />
  );
}
