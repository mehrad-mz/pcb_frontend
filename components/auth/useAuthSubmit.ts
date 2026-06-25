"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/api/errors";

export function useAuthSubmit() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(task: () => Promise<void>) {
    setError("");
    setLoading(true);
    try {
      await task();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { error, setError, loading, run };
}
