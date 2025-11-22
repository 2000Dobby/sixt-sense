import type { UpsellDataSource } from "./dataSource";
import { sixtDataSource } from "./dataSource.sixt";
import { mockDataSource } from "./dataSource.mock";

const useMock = process.env.USE_MOCK_DATA === "true";

export const dataSource: UpsellDataSource = useMock ? mockDataSource : sixtDataSource;

/**
 * Current UpsellDataSource.
 * Controlled via process.env.USE_MOCK_DATA:
 *  - "true"  → mockDataSource (demo data, no external calls)
 *  - "false" → sixtDataSource (real Sixt API)
 */

