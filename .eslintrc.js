module.exports = {
    root: true,
    env: {
        es6: true,
        jest: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "indent": ["error", 4],
        "max-len": [
            "error",
            {
                "code": 100,
                "tabWidth": 2,
                "ignoreComments": true, //"comments": 80
                "ignoreUrls": true,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true
            }
        ],
        "quotes": ["error", "double"],
        "comma-dangle": ["error", "only-multiline"],
        "semi-style": ["error", "last"],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "off",
    },
};