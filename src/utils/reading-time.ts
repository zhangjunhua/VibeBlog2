export function getReadingTime(body: string | undefined) {
  const text = (body ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|\-]/g, " ");
  const chineseCharacters = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const englishWords =
    text.replace(/[\u3400-\u9fff]/g, " ").match(/[a-z0-9]+(?:['-][a-z0-9]+)*/gi)
      ?.length ?? 0;

  return Math.max(1, Math.ceil(chineseCharacters / 350 + englishWords / 200));
}
