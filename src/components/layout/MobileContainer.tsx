export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white dark:bg-gray-950">
      {children}
    </div>
  );
}
