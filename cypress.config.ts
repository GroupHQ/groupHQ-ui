import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "afx442",
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});
