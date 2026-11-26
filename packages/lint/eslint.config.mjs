import {emberboxEslint} from './src/eslint.mjs'

export default await emberboxEslint({nodeFiles: ['src/**/*.mjs', 'test/**/*.ts']})
