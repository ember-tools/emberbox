/**
 * Finds the comments of a source file that are neither doc comments nor TODO markers.
 *
 * <p>Python and the script languages are read in one pass over their characters, which is the only
 * way to tell a comment from the same characters inside a string: an address in a string, a
 * protocol in a template literal and a `#` inside a docstring all look like a comment otherwise.
 */

const TODO = /^(\/\/|\/\*|#)\s*TODO\b/
const TEMPLATE_COMMENT = '<!--'

const LINE_MESSAGE = 'Only doc comments and TODO markers are allowed; put the reasoning in the doc comment of the'
    + ' enclosing class or function.'

/**
 * The comments of a Python file that are not a docstring, a shebang or a TODO.
 *
 * @param text the file's source
 * @returns the findings, each with its line and message
 */
export function pythonFindings(text) {
    const found = []
    let line = 1
    let quote = null
    for (let i = 0; i < text.length; i++) {
        const c = text[i]
        if (c === '\n') {
            line++
            if (quote?.length === 1) quote = null
            continue
        }
        if (quote) {
            if (c === '\\') {
                if (text[i + 1] === '\n') line++
                i++
            } else if (text.startsWith(quote, i)) {
                i += quote.length - 1
                quote = null
            }
            continue
        }
        if (c === '"' || c === "'") {
            const triple = c.repeat(3)
            quote = text.startsWith(triple, i) ? triple : c
            i += quote.length - 1
            continue
        }
        if (c !== '#') continue
        const end = endOfLine(text, i)
        const comment = text.slice(i, end)
        const shebang = line === 1 && i === 0 && comment.startsWith('#!')
        if (!shebang && !TODO.test(comment)) {
            found.push({line, message: `Comment at column ${i - text.lastIndexOf('\n', i - 1)}. ${LINE_MESSAGE}`})
        }
        i = end - 1
    }
    return found
}

/**
 * The comments of a script or a single file component that are not doc comments or TODOs. In a
 * component the template is markup, where every comment is reported, and the script is code.
 *
 * @param text the file's source
 * @param markup whether the file is a single file component
 * @returns the findings, each with its line and message
 */
export function scriptFindings(text, markup) {
    const found = []
    let line = 1
    let quote = null
    let inCode = !markup
    let operandExpected = true
    for (let i = 0; i < text.length; i++) {
        const c = text[i]
        if (c === '\n') {
            line++
            if (quote && quote !== '`') quote = null
            continue
        }
        if (markup && atLineStart(text, i)) {
            const tag = text.slice(i).match(/^\s*<(\/?)(script|style)\b/)
            if (tag) {
                inCode = tag[1] === ''
                i = endOfLine(text, i) - 1
                continue
            }
        }
        if (!inCode) {
            if (text.startsWith(TEMPLATE_COMMENT, i)) {
                found.push({line, message: 'Template comment. Name the block with a component or a class instead.'})
                const end = text.indexOf('-->', i)
                const stop = end === -1 ? text.length : end + 3
                line += countLines(text, i, stop)
                i = stop - 1
            }
            continue
        }
        if (quote) {
            if (c === '\\') {
                if (text[i + 1] === '\n') line++
                i++
            } else if (c === quote) quote = null
            continue
        }
        if (c === '"' || c === "'" || c === '`') {
            quote = c
            operandExpected = false
            continue
        }
        if (c === '/' && operandExpected && text[i + 1] !== '/' && text[i + 1] !== '*') {
            i = endOfRegex(text, i) - 1
            operandExpected = false
            continue
        }
        if (c === '#' && i === 0 && text[1] === '!') {
            i = endOfLine(text, i) - 1
            continue
        }
        if (text.startsWith('/*', i)) {
            const end = text.indexOf('*/', i + 2)
            const stop = end === -1 ? text.length : end + 2
            const block = text.slice(i, stop)
            if (!block.startsWith('/**') && !TODO.test(block)) {
                found.push({line, message: 'Block comment that is not a doc comment. Put the reasoning in the doc comment of'
                    + ' the class or function it belongs to, or rewrite the passage so it needs none.'})
            }
            line += countLines(text, i, stop)
            i = stop - 1
            continue
        }
        if (text.startsWith('//', i)) {
            const end = endOfLine(text, i)
            if (!TODO.test(text.slice(i, end))) {
                found.push({line, message: `Line comment at column ${i - text.lastIndexOf('\n', i - 1)}. ${LINE_MESSAGE}`})
            }
            i = end - 1
            continue
        }
        if (/\s/.test(c)) continue
        operandExpected = OPERAND_BEFORE.has(c) || precedingKeyword(text, i)
    }
    return found
}

/** The characters after which a `/` starts a regular expression rather than dividing. */
const OPERAND_BEFORE = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^'])

/** The keywords after which a `/` starts a regular expression. */
const KEYWORDS_BEFORE_OPERAND = /(?:^|[^\w$])(?:return|typeof|case|do|else|in|of|void|throw|delete|new|yield|await)$/

/**
 * Whether the word ending at a position is a keyword after which an operand follows.
 *
 * @param text the source
 * @param at the position of the word's last character
 * @returns true after such a keyword
 */
function precedingKeyword(text, at) {
    if (!/[\w$]/.test(text[at])) return false
    return KEYWORDS_BEFORE_OPERAND.test(text.slice(Math.max(0, at - 10), at + 1)) && !/[\w$]/.test(text[at + 1] ?? '')
}

/**
 * Where a regular expression literal starting at a position ends, its flags included; a literal
 * left open ends with its line.
 *
 * @param text the source
 * @param start the position of the opening slash
 * @returns the index after the literal
 */
function endOfRegex(text, start) {
    let inClass = false
    for (let i = start + 1; i < text.length; i++) {
        const c = text[i]
        if (c === '\n') return i
        if (c === '\\') i++
        else if (c === '[') inClass = true
        else if (c === ']') inClass = false
        else if (c === '/' && !inClass) {
            let end = i + 1
            while (end < text.length && /[a-z]/i.test(text[end])) end++
            return end
        }
    }
    return text.length
}

/**
 * Where the line holding a position ends.
 *
 * @param text the source
 * @param from the position
 * @returns the index of the line break, or the length of the text
 */
function endOfLine(text, from) {
    const end = text.indexOf('\n', from)
    return end === -1 ? text.length : end
}

/**
 * Whether a position is the first character of its line.
 *
 * @param text the source
 * @param at the position
 * @returns true at the start of a line
 */
function atLineStart(text, at) {
    return at === 0 || text[at - 1] === '\n'
}

/**
 * How many line breaks lie in a span.
 *
 * @param text the source
 * @param from where the span starts
 * @param to where it ends
 * @returns the number of line breaks
 */
function countLines(text, from, to) {
    let count = 0
    for (let i = from; i < to; i++) if (text[i] === '\n') count++
    return count
}
