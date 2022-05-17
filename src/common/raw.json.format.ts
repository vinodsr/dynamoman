/**
 * RAW Data export format
 */
export interface RawJsonFormat {
  records: unknown[];
  timestamp: number;
  description: string;
  table: string;
  region?: string;
}
