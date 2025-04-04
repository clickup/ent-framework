/**
 * Parses a WAL LSN number into a JS bigint.
 */
export function parseLsn(lsn: string): bigint {
  const [a, b] = lsn.split("/").map((x) => BigInt(parseInt(x, 16)));
  return (a << BigInt(32)) + b;
}
