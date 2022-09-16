module.exports = {
    preset: "jest-preset-angular",
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/app/*.component.ts",
        "src/app/*.service.ts",
        "src/app/*.component.html",
        "src/app/**/*.component.ts",
        "src/app/**/*.html"],
    silent: true
};
