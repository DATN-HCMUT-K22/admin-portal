"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as configsApi from "@/lib/api/configs";
import { useAdminStore } from "@/stores/admin-store";
import type { SystemConfigResponse, SystemConfigUpdateRequest } from "@/types/api";

export function useConfigs() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.configs(),
    queryFn: () => configsApi.getAllConfigs(),
    enabled: !!token?.trim(),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      body,
    }: {
      key: string;
      body: SystemConfigUpdateRequest;
    }) => configsApi.updateConfig(key, body),
    
    // Optimistic Update
    onMutate: async ({ key, body }) => {
      await qc.cancelQueries({ queryKey: queryKeys.admin.configs() });
      
      const previousConfigs = qc.getQueryData<SystemConfigResponse[]>(
        queryKeys.admin.configs()
      );
      
      if (previousConfigs) {
        qc.setQueryData<SystemConfigResponse[]>(
          queryKeys.admin.configs(),
          previousConfigs.map((config) =>
            config.key === key
              ? { ...config, value: body.value, description: body.description ?? config.description }
              : config
          )
        );
      }
      
      return { previousConfigs };
    },
    onError: (err, variables, context) => {
      if (context?.previousConfigs) {
        qc.setQueryData(queryKeys.admin.configs(), context.previousConfigs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure synchronization
      void qc.invalidateQueries({ queryKey: queryKeys.admin.configs() });
    },
  });
}
