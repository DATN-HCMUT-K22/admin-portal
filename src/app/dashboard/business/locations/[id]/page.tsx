"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeleteLocation, useUpdateLocation } from "@/hooks/use-admin-queries";
import { locationUpsertSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";

type Form = z.infer<typeof locationUpsertSchema>;

export default function EditLocationPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");

  const updateMut = useUpdateLocation(id);
  const deleteMut = useDeleteLocation();

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Cập nhật địa điểm</h1>
        <span className="font-mono text-xs text-muted-foreground">{id}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Điền thông tin và lưu. Form không tự tải dữ liệu từ server.
      </p>
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
          await updateMut
            .mutateAsync({
              ...v,
              opening_hours,
              rating:
                rating !== undefined && !Number.isNaN(rating) ? rating : undefined,
              user_ratings_total:
                user_ratings_total !== undefined && !Number.isNaN(user_ratings_total)
                  ? user_ratings_total
                  : undefined,
            })
            .catch(() => undefined);
        })}
      >
        <input
          {...form.register("name")}
          placeholder="Tên"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          {...form.register("location_type")}
          placeholder="POI"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("is_verified")} />
          Đã xác minh
        </label>
        <select
          {...form.register("operational_status")}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="OPERATIONAL">OPERATIONAL</option>
          <option value="CLOSED_TEMPORARILY">CLOSED_TEMPORARILY</option>
          <option value="CLOSED_PERMANENTLY">CLOSED_PERMANENTLY</option>
        </select>
        <input
          {...form.register("hotline")}
          placeholder="Hotline"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          {...form.register("website")}
          placeholder="Website"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <textarea
          {...form.register("opening_hours")}
          placeholder="opening_hours JSON"
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
        />
        <button
          type="submit"
          disabled={updateMut.isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
        >
          {updateMut.isPending ? "Đang lưu…" : "Cập nhật"}
        </button>
        {updateMut.isError && (
          <p className="text-sm text-destructive">
            {(updateMut.error as Error).message}
          </p>
        )}
        {updateMut.isSuccess && (
          <p className="text-sm text-primary">Đã gửi cập nhật.</p>
        )}
      </form>

      <div className="border-t border-border pt-6">
        <button
          type="button"
          className="text-sm text-destructive underline"
          onClick={() => {
            if (!confirm("Soft-delete địa điểm này?")) return;
            void deleteMut.mutateAsync(id).then(() => {
              router.push("/dashboard/business/locations");
            });
          }}
        >
          Xóa mềm (DELETE)
        </button>
        {deleteMut.isError && (
          <p className="mt-2 text-sm text-destructive">
            {(deleteMut.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
