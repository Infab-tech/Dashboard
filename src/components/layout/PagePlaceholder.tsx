export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400 dark:border-neutral-700 dark:text-neutral-600">
        Structure only — data and interactions land in a later pass.
      </div>
    </div>
  );
}
