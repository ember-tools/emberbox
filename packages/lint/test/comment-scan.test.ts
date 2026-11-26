import {describe, expect, it} from 'vitest'
import {pythonFindings, scriptFindings} from '../src/cli/comment-scan.mjs'

/**
 * Telling comments from the same characters inside strings, in Python and in scripts.
 *
 * @vitest-environment node
 */
const lines = (found: {line: number}[]) => found.map(one => one.line)

describe('pythonFindings', () => {
    it('reports a comment at the end of a line and on a line of its own', () => {
        expect(lines(pythonFindings('x = 1  # warum\n# weshalb\ny = 2\n'))).toEqual([1, 2])
    })

    it('leaves docstrings, strings, the shebang and TODO markers alone', () => {
        const text = '#!/usr/bin/env python\n"""Modul.\n\n# kein Kommentar\n"""\nx = "# auch keiner"\ny = 1  # TODO: fehlt\n'
        expect(pythonFindings(text)).toEqual([])
    })

    it('does not take a triple quote inside a string for a docstring', () => {
        expect(lines(pythonFindings("x = \"'''\"\ny = 1  # versteckt\n"))).toEqual([2])
    })

    it('does not take a triple quote inside a comment for a docstring', () => {
        expect(lines(pythonFindings('x = 1  # siehe """\ny = 2  # versteckt\n'))).toEqual([1, 2])
    })
})

describe('scriptFindings', () => {
    it('reports line and block comments but not doc comments or TODOs', () => {
        const text = '/** Doc. */\nconst a = 1 // warum\n/* block */\n// TODO: fehlt\nconst b = 2\n'
        expect(lines(scriptFindings(text, false))).toEqual([2, 3])
    })

    it('leaves addresses and comment openers inside strings alone', () => {
        expect(scriptFindings("const u = 'https://calltaker.chojo.dev'\nconst t = `/* nein */`\n", false)).toEqual([])
    })

    it('reads quotes inside a regular expression as part of it', () => {
        expect(lines(scriptFindings("const r = /[^']*/\nconst a = 1\n// versteckt\n", false))).toEqual([3])
        expect(scriptFindings("const r = /'/\nconst u = 'http://x'\n", false)).toEqual([])
        expect(lines(scriptFindings('const r = text.match(/"/g)\nconst q = a / b // geteilt\n', false))).toEqual([2])
    })

    it('ends a plain string at the end of its line and counts escaped line breaks', () => {
        expect(lines(scriptFindings("const s = 'offen\nconst a = 1 // da\n", false))).toEqual([2])
        expect(lines(scriptFindings('const s = `a\\\nb`\n// x\n', false))).toEqual([3])
        expect(lines(pythonFindings('s = "a\\\nb"\n# x\n'))).toEqual([3])
    })

    it('reports template comments and reads only the script of a component as code', () => {
        const text = '<script setup lang="ts">\nconst a = 1 // warum\n</script>\n\n<template>\n    <!-- weg -->\n    <a href="https://x.de">x</a>\n</template>\n'
        expect(lines(scriptFindings(text, true))).toEqual([2, 6])
    })
})
