import { sql } from "@/lib/db";

export interface DepreciationEntry {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  category_name: string;
  period_date: string;
  depreciation_amount: number;
  book_value: number;
  created_at: string;
}

export interface DisposalEntry {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  disposal_date: string;
  reason: string;
  sale_price: number;
  approved_by_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface DepreciationSummary {
  totalDepreciationValue: number;
  totalBookValue: number;
  totalEntries: number;
  totalDisposals: number;
}

export async function getDepreciationData(): Promise<{
  entries: DepreciationEntry[];
  disposals: DisposalEntry[];
  summary: DepreciationSummary;
}> {
  const [entriesRows, disposalsRows, summaryRow] = await Promise.all([
    sql<
      Array<
        Omit<DepreciationEntry, "depreciation_amount" | "book_value"> & {
          depreciation_amount: string;
          book_value: string;
        }
      >
    >`
      SELECT
        ad.id::text,
        ad.asset_id::text,
        a.asset_code,
        a.name AS asset_name,
        ac.name AS category_name,
        ad.period_date::text,
        ad.depreciation_amount::text,
        ad.book_value::text,
        ad.created_at::text
      FROM asset_depreciations ad
      JOIN assets a ON a.id = ad.asset_id
      JOIN asset_categories ac ON ac.id = a.category_id
      WHERE a.is_deleted = FALSE
      ORDER BY ad.period_date DESC, ad.created_at DESC
      LIMIT 200;
    `,
    sql<
      Array<
        Omit<DisposalEntry, "sale_price"> & {
          sale_price: string;
        }
      >
    >`
      SELECT
        disp.id::text,
        disp.asset_id::text,
        a.asset_code,
        a.name AS asset_name,
        disp.disposal_date::text,
        disp.reason,
        disp.sale_price::text,
        emp.full_name AS approved_by_name,
        disp.notes,
        disp.created_at::text
      FROM asset_disposals disp
      JOIN assets a ON a.id = disp.asset_id
      LEFT JOIN employees emp ON emp.id = disp.approved_by
      WHERE a.is_deleted = FALSE
      ORDER BY disp.disposal_date DESC, disp.created_at DESC;
    `,
    sql<
      Array<{
        total_depreciation: string;
        total_entries: number;
        total_disposals: number;
      }>
    >`
      SELECT
        (SELECT COALESCE(SUM(depreciation_amount), 0)::text FROM asset_depreciations) AS total_depreciation,
        (SELECT COUNT(*)::int FROM asset_depreciations) AS total_entries,
        (SELECT COUNT(*)::int FROM asset_disposals) AS total_disposals;
    `,
  ]);

  const entries: DepreciationEntry[] = entriesRows.map((r) => ({
    ...r,
    depreciation_amount: Number(r.depreciation_amount ?? 0),
    book_value: Number(r.book_value ?? 0),
  }));

  const disposals: DisposalEntry[] = disposalsRows.map((r) => ({
    ...r,
    sale_price: Number(r.sale_price ?? 0),
  }));

  const latestBookValueSum = entries.reduce((acc, curr) => acc + curr.book_value, 0);

  return {
    entries,
    disposals,
    summary: {
      totalDepreciationValue: Number(summaryRow[0]?.total_depreciation ?? 0),
      totalBookValue: latestBookValueSum,
      totalEntries: Number(summaryRow[0]?.total_entries ?? 0),
      totalDisposals: Number(summaryRow[0]?.total_disposals ?? 0),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getDepreciationData === "function", "getDepreciationData missing");
  console.log("depreciation lib self-check ok");
}
