"use client";

import { useEffect } from "react";
import { ServerErrorClient } from "@/components/server-error/server-error-client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ServerErrorClient reset={reset} />;
}
