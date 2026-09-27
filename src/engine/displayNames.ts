/** Also normalizes historical saves without changing IDs or resource keys. */
export function normalizeDisplayNames(text: string): string {
  return text.replace(/\u5146\u51ef/g, '照凯')
    .replace(/\u5c01\u5b89\u4fdd/g, '封安宝')
    .replace(/\u5b89\u4fdd(体制|全面复辟|的高压|的旧官僚)/g, '安宝$1')
    .replace(/打倒\u5b89\u4fdd/g, '打倒安宝');
}
