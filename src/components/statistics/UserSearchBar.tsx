"use client";

import { useState, useEffect } from "react";
import { useSearchUsers } from "@/hooks/use-admin-queries";

interface Props {
  onSelect: (userId: string, username: string) => void;
}

export function UserSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [] } = useSearchUsers(debouncedQuery);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Tìm kiếm người dùng (username hoặc tên)..."
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
      />

      {showResults && results.length > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-border bg-background shadow-lg">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelect(user.id, user.username);
                setQuery("");
                setShowResults(false);
              }}
              className="w-full px-4 py-3 text-left transition hover:bg-accent"
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">{user.fullName}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
