/**
 * RAW Data export format
 */
export interface RawJsonFormat {
  records: unknown[];
  timestamp: string;
  description: string;
  table: string;
}
