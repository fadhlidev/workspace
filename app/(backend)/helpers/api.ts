export function getApiErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (err as Error).message ||
    "Terjadi kesalahan"
  );
}
