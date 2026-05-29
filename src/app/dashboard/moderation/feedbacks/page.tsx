"use client";

import { FeedbackList } from "@/components/feedback/FeedbackList";

export default function FeedbacksPage() {
  return <FeedbackList pathPrefix="/dashboard/moderation/feedbacks" />;
}
