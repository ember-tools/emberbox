/**
 * An object type written inline in `ref<>`: a state's shape is worth a name, which the code that
 * reads the state can then refer to.
 */
export const INLINE_STATE_TYPE = {
    selector: "CallExpression[callee.name='ref']:matches([typeArguments.params.0.type='TSTypeLiteral'], [typeArguments.params.0.types.0.type='TSTypeLiteral'])",
    message: 'Inline object type in ref<>: give the type a name.',
}

/**
 * The `no-restricted-syntax` rules for scripts and for Vue templates alike.
 *
 * @param restrictions the selectors with their messages
 * @returns the rule entries
 */
export function restrictSyntax(...restrictions) {
    return {
        'no-restricted-syntax': ['error', ...restrictions],
        'vue/no-restricted-syntax': ['error', ...restrictions],
    }
}
