declare module "marked-extended-tables" {
  import type { MarkedExtension } from "marked";
  export default function extendedTables(
    options?: Record<string, unknown>
  ): MarkedExtension;
}
