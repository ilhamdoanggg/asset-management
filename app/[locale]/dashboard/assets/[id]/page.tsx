import { notFound } from "next/navigation";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getAsset, getAssetHistory } from "@/lib/assets";
import { AssetDetail } from "@/components/assets/asset-detail";

export const instant = false;

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const asset = await getAsset(id);
  if (!asset) notFound();
  const history = await getAssetHistory(asset.id);

  return (
    <AssetDetail asset={asset} history={history} dict={dict.assets} locale={currentLocale} />
  );
}

