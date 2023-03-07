module.exports = {
    preset: "jest-preset-angular",
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    collectCoverage: true,
    testMatch: ["**/*.jest.spec.ts"],
    collectCoverageFrom: [
        "src/app/*.component.ts",
        "src/app/*.service.ts",
        "src/app/*.component.html",
        "src/app/**/*.component.ts",
        "src/app/**/*.html"],
    silent: true
};
