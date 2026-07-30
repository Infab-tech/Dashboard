export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      <p className="text-sm text-neutral-500">{description}</p>
      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400">
        Structure only — data and interactions land in a later pass.
      </div>
    </div>
  );
}
