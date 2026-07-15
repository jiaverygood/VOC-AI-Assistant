export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-none border border-border-subtle bg-surface-card px-5 py-4 text-center text-sm text-text-secondary">
      {message}
    </div>
  );
}
