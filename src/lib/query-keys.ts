export const queryKeys = {
  admin: {
    users: (page?: number) => ["admin", "users", page] as const,
    user: (userId: string) => ["admin", "user", userId] as const,
    roles: () => ["admin", "roles"] as const,
    permissions: () => ["admin", "permissions"] as const,
    reports: (params?: { status?: string; contentType?: string }) =>
      ["admin", "reports", params] as const,
    report: (id: string) => ["admin", "report", id] as const,
    feedbacks: () => ["admin", "feedbacks"] as const,
    feedback: (id: string) => ["admin", "feedback", id] as const,
    administrative: (type?: string, country?: string) =>
      ["admin", "administrative", type, country] as const,
  },
} as const;
