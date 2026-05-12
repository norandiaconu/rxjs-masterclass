import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
    {
        ignores: [".angular/", "src/main.ts"]
    },
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended, ...angular.configs.tsRecommended, eslint.configs.recommended],
        processor: angular.processInlineTemplates,
        plugins: {
            import: importPlugin
        },
        rules: {
            "@angular-eslint/component-selector": ["error", { type: "element", prefix: "app", style: "kebab-case" }],
            "import/order": ["warn", { alphabetize: { order: "asc", caseInsensitive: true } }]
        }
    },
    {
        files: ["**/*.html"],
        extends: [...angular.configs.templateRecommended]
    }
);
