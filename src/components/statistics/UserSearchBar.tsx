"use client";

import { useState } from "react";
import { Select } from "antd";
import { useSearchUsers } from "@/hooks/use-admin-queries";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  onSelect: (userId: string, username: string) => void;
}

export function UserSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  
  const { data: results = [], isLoading } = useSearchUsers(debouncedQuery);

  const options = results.map(user => ({
    label: (
      <div className="flex flex-col py-1">
        <span className="font-medium leading-none mb-1">{user.username}</span>
        <span className="text-xs text-muted-foreground leading-none">
          {user.fullName || "Chưa cập nhật tên"}
        </span>
      </div>
    ),
    value: user.id,
    user
  }));

  return (
    <Select
      showSearch
      allowClear
      placeholder="Tìm kiếm người dùng (nhập username hoặc tên)..."
      className="w-full max-w-md"
      size="large"
      loading={isLoading}
      filterOption={false}
      onSearch={setQuery}
      onClear={() => {
        setQuery("");
        onSelect("", "");
      }}
      onSelect={(value, option) => {
        onSelect(value, option.user.username);
      }}
      options={options}
      notFoundContent={
        isLoading 
          ? "Đang tìm kiếm..." 
          : debouncedQuery.length >= 2 
            ? "Không tìm thấy người dùng nào" 
            : "Nhập ít nhất 2 ký tự để tìm kiếm"
      }
    />
  );
}
