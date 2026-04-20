"use client";

import { useState } from "react";
import { useAdministrative } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";

export default function AdministrativePage() {
  const [type, setType] = useState<string>("");
  const [country, setCountry] = useState("VN");

  const { data, isLoading, error, refetch } = useAdministrative(
    type || undefined,
    country || undefined
  );
  const err = error as Error | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ranh giới hành chính</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lọc theo loại (COUNTRY, PROVINCE) và quốc gia.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Mọi type</option>
          <option value="COUNTRY">COUNTRY</option>
          <option value="PROVINCE">PROVINCE</option>
        </select>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="country, ví dụ VN"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground"
        >
          Tải lại
        </button>
      </div>
      <QueryState isLoading={isLoading} error={err}>
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-border bg-muted p-4 text-xs">
          {JSON.stringify(data ?? [], null, 2)}
        </pre>
      </QueryState>
    </div>
  );
}
