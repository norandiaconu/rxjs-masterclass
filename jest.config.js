module.exports = {
    globals: {
        "ts-jest": {
            stringifyContentPathRegex: "\\.(html|svg)$",
        },
    },
    transform: {
        "^.+.(ts|mjs|js|html)$": "jest-preset-angular",
    }
};
