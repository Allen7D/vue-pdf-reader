/**
 * 生成[start, end) 区间内所有整数
 * @param {*} start
 * @param {*} end
 * @returns
 */
export function range(start, end) {
  const length = end - start;
  return Array.from({ length }).map((_, index) => start + index);
}
