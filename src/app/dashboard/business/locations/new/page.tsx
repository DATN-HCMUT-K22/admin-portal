"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLocation } from "@/hooks/use-admin-queries";
import { locationUpsertSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";

type Form = z.infer<typeof locationUpsertSchema>;

export default function NewLocationPage() {
  const router = useRouter();
  const mut = useCreateLocation();
  const form = useForm<Form>({
    resolver: zodResolver(locationUpsertSchema),
    defaultValues: {
      name: "",
      location_type: "POI",
      is_verified: false,
      operational_status: "OPERATIONAL",
      hotline: "",
      website: "",
      opening_hours: "",
      rating: "",
      user_ratings_total: "",
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Tạo địa điểm</h1>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (v) => {
          const opening_hours = v.opening_hours?.trim()
            ? (() => {
                try {
                  return JSON.parse(v.opening_hours!) as Record<string, unknown>;
                } catch {
                  return { raw: v.opening_hours };
                }
              })()
            : undefined;
          const rating =
            v.rating?.trim() === ""
              ? undefined
              : Number(v.rating);
          const user_ratings_total =
            v.user_ratings_total?.trim() === ""
              ? undefined
              : parseInt(String(v.user_ratings_total), 10);
          const payload = {
            ...v,
            opening_hours,
            rating: rating !== undefined && !Number.isNaN(rating) ? rating : undefined,
            user_ratings_total:
              user_ratings_total !== undefined && !Number.isNaN(user_ratings_total)
                ? user_ratings_total
                : undefined,
          };
          const res = await mut.mutateAsync(payload).catch(() => undefined);
          if (res && typeof res === "object" && "id" in res && res.id) {
            router.push(`/dashboard/business/locations/${String(res.id)}`);
          }
        })}
      >
        <Field label="Tên" error={form.formState.errors.name?.message}>
          <input
            {...form.register("name")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Loại" error={form.formState.errors.location_type?.message}>
          <input
            {...form.register("location_type")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("is_verified")} />
          Đã xác minh
        </label>
        <Field
          label="Trạng thái vận hành"
          error={form.formState.errors.operational_status?.message}
        >
          <select
            {...form.register("operational_status")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="OPERATIONAL">OPERATIONAL</option>
            <option value="CLOSED_TEMPORARILY">CLOSED_TEMPORARILY</option>
            <option value="CLOSED_PERMANENTLY">CLOSED_PERMANENTLY</option>
          </select>
        </Field>
        <Field label="Hotline" error={form.formState.errors.hotline?.message}>
          <input
            {...form.register("hotline")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Website" error={form.formState.errors.website?.message}>
          <input
            {...form.register("website")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field
          label="Giờ mở cửa (JSON hoặc text)"
          error={form.formState.errors.opening_hours?.message}
        >
          <textarea
            {...form.register("opening_hours")}
            rows={3}
            placeholder='{"raw": "8h-20h"}'
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rating" error={form.formState.errors.rating?.message}>
            <input
              type="number"
              step="0.1"
              {...form.register("rating")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field
            label="Số lượt rating"
            error={form.formState.errors.user_ratings_total?.message}
          >
            <input
              type="number"
              {...form.register("user_ratings_total")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
        >
          {mut.isPending ? "Đang tạo…" : "Tạo địa điểm"}
        </button>
        {mut.isError && (
          <p className="text-sm text-destructive">
            {(mut.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
