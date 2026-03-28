import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma", "schema"),
  datasource: {
    url: process.env.DIRECT_DATABASE_URL!,
  },
});
