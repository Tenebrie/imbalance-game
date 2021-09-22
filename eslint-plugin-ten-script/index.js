module.exports = {
	rules: {
		'async-func-name': {
			create: function (context) {
				return {
					CallExpression(node) {
						const identifier = node.callee && node.callee.property && node.callee.property.type === 'Identifier' && node.callee.property.name === 'startDialog'
						if (identifier && node.arguments[0].type === 'TemplateLiteral') {
							const template = node.arguments[0]
							const args = template.expressions.map(e => `${e.property?.name.toUpperCase()}`)
							const quasis = template.quasis.map(q => q.value.cooked)
							// console.log(args)
							// console.log(quasis)

							const result = quasis.flatMap(
								(element, index) => args[index] ? element + args[index] : element
							);
							const parsedScript = parseTenScript(result)
							console.log(parsedScript.errors)
							context.report({
								node,
								message: "Async function name must end in 'Async'",
							})

							// console.log(node.arguments[0].expressions)
						}
						// TODO: Support for arrow functions
						if (identifier && !node.arguments[0].quasis) {
							// console.log(node)
						}
					},
				}
			},
		},
	},
}
