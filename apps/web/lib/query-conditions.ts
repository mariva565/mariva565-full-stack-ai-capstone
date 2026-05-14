import { and, type SQL } from "drizzle-orm";

export function combineConditions(conditions: Array<SQL | undefined>): SQL | undefined {
  const applied = conditions.filter(Boolean) as SQL[];
  return applied.length > 0 ? and(...applied) : undefined;
}
