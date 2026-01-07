import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
    env: process.env,
    e2e: {
        baseUrl: "http://localhost:3000",
        setupNodeEvents() {
            // implement node event listeners here
        },
    },
});

