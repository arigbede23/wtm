// Mobile Container — constrains the app to a phone-width column.
// max-w-md (448px) keeps the layout looking like a mobile app even on desktop.
// min-h-screen makes sure the background fills the full viewport height.

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white dark:bg-gray-950">
      {children}
    </div>
  );
}
