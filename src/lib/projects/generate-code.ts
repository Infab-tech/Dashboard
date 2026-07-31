import type { PrismaClient } from "@prisma/client";

/** Strip wrapping punctuation (brackets/quotes) that shouldn't survive into a code. */
function stripBrackets(token: string): string {
  return token.replace(/[()[\]{}"']/g, "");
}

/**
 * A token counts as an "already existing abbreviation" if it carries a digit
 * (280, A1, 330) or has 2+ uppercase letters anywhere in it — that catches
 * both full-caps acronyms (DPS, BIRAC, ICMR) and mixed-case ones (mRNA)
 * without misfiring on ordinary Title Case words (Cancer, On, Chip), which
 * only ever have one capital.
 */
function isAbbreviationLike(token: string): boolean {
  if (/\d/.test(token)) return true;
  const upperCount = (token.match(/[A-Z]/g) ?? []).length;
  return upperCount >= 2;
}

function isSymbolToken(token: string): boolean {
  return !/[a-zA-Z0-9]/.test(token);
}

function firstLetter(token: string): string | null {
  const match = token.match(/[a-zA-Z]/);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Derives a human-readable code from a project name: initials of the plain
 * leading words, plus whatever distinctive abbreviation/number the title
 * already carries. Three shapes, depending on where the abbreviation falls:
 *  - none at all           -> initials of every word ("Pressure Switch Parking Brake" -> PSPB)
 *  - abbreviation leads     -> abbreviation kept as-is + initials of the rest ("ITC Heater" -> ITC-H)
 *  - abbreviation trails    -> initials of the lead words + the abbreviation/number tail,
 *                              dropping any plain trailing words ("Pressure Transducer 280 & 330 Bar" -> PT-280&330)
 * Not collision-safe by itself — see `resolveUniqueProjectCode`.
 */
export function generateProjectCode(name: string): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .map(stripBrackets)
    .filter((token) => token.length > 0);

  if (tokens.length === 0) return "";

  const splitIndex = tokens.findIndex(isAbbreviationLike);

  if (splitIndex === -1) {
    return tokens.map(firstLetter).filter(Boolean).join("");
  }

  if (splitIndex === 0) {
    const abbrev = tokens[0];
    const restInitials = tokens.slice(1).map(firstLetter).filter(Boolean).join("");
    return restInitials ? `${abbrev}-${restInitials}` : abbrev;
  }

  const prefix = tokens.slice(0, splitIndex).map(firstLetter).filter(Boolean).join("");
  const tail = tokens.slice(splitIndex).filter((token) => isAbbreviationLike(token) || isSymbolToken(token));
  const suffix = tail.join("");
  return suffix ? `${prefix}-${suffix}` : prefix;
}

/**
 * Resolves a generated code to one that's actually free in the DB, appending
 * -2, -3, ... on collision. `excludeId` lets a rename check uniqueness
 * against every *other* project without tripping over its own current code.
 */
export async function resolveUniqueProjectCode(
  prisma: PrismaClient,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateProjectCode(name) || "PRJ";
  let candidate = base;
  let attempt = 2;

  while (
    await prisma.project.findFirst({
      where: { code: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${attempt}`;
    attempt++;
  }

  return candidate;
}
