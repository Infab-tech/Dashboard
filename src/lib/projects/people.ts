import type { Prisma, PrismaClient } from "@prisma/client";

type PersonClient = Pick<PrismaClient | Prisma.TransactionClient, "person">;

/**
 * Finds a Person by case-insensitive name match, creating one if none exists.
 * Shared by the Excel import (many rows, one call per name — pass a cache to
 * avoid duplicate creates within a single import) and direct project creation
 * (single call, no cache needed).
 */
export async function resolvePersonId(
  client: PersonClient,
  name: string | null,
  cache?: Map<string, string>,
): Promise<string | null> {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (cache?.has(key)) return cache.get(key)!;

  const existing = await client.person.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  const id = existing ? existing.id : (await client.person.create({ data: { name } })).id;
  cache?.set(key, id);
  return id;
}
