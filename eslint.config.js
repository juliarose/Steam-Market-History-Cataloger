import jsdoc from "eslint-plugin-jsdoc";
import pluginJs from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";

export default [
    pluginJs.configs.recommended,
    {
        "ignores": [
            "eslint.config.js",
            "node_modules/**",
            "js/lib/**",
            "js/content/**",
            "tests/*",
            "dist/**",
            "dev/**",
        ]
    },
    {
        "languageOptions": {
            "ecmaVersion": 13,
            "sourceType": "module",
            "parser": babelParser,
            "globals": {
                ...globals.browser,
                "BigInt": false,
                "moment": false,
                "Velocity": false,
                "chrome": false,
                "Chartist": false,
                "Dexie": false
            }
        },
        "plugins": {
            jsdoc
        },
        "rules": {
            "jsdoc/require-description": "error",
            "jsdoc/check-values": "error",
            "jsdoc/require-description-complete-sentence": "error",
            "indent": [
                "error",
                4,
                {
                  "SwitchCase": 1
                }
            ],
            "no-unused-vars": "warn",
            "object-curly-spacing": [
                "error",
                "always"
            ],
            "no-empty": [
                "error",
                {
                    "allowEmptyCatch": true
                }
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
            "quotes": [
                "error",
                "single"
            ],
            "no-cond-assign": [
                "off"
            ],
            "no-useless-escape": [
                "off"
            ],
            "semi": [
                "error",
                "always"
            ],
            "no-redeclare": [
                2,
                {
                    "builtinGlobals": true
                }
            ],
            "no-console": 0,
            "no-undef": [
                "error"
            ]
        }
    }
];
