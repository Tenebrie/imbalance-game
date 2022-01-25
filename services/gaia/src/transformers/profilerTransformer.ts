import ts from 'typescript'

if (process.env.NODE_ENV === 'development' || process.env.PROFILER === 'force') {
	console.warn(`\u001b[33;1mProfiler enabled. Performance may be reduced.\u001b[0m`)
}

const transformer = (_: ts.Program) => (transformationContext: ts.TransformationContext) => (sourceFile: ts.SourceFile): ts.Node => {
	function visitNode(node: ts.Node): ts.VisitResult<ts.Node> {
		const file = node.getSourceFile()
		if (
			!file ||
			(process.env.NODE_ENV !== 'development' && process.env.PROFILER !== 'force') ||
			process.env.JEST_WORKER_ID !== undefined ||
			file.fileName.includes('/shared/') ||
			file.fileName.includes('profiler.ts')
		) {
			return ts.visitEachChild(node, visitNode, transformationContext)
		}

		if (node && ts.isSourceFile(node)) {
			if (file.fileName.endsWith('ts')) {
				const profilerPath = file.fileName.endsWith('app.ts') ? './profiler/profiler' : '@src/profiler/profiler'

				const updatedSourceFile = ts.factory.updateSourceFile(file, [
					ts.factory.createVariableStatement(
						undefined,
						ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(
								'tenProfiler',
								undefined,
								undefined,
								ts.factory.createPropertyAccessExpression(
									ts.factory.createCallExpression(
										ts.factory.createIdentifier('require'),
										[],
										[ts.factory.createStringLiteral(profilerPath)]
									),
									'default'
								)
							),
						])
					),
					...file.statements,
				])

				return ts.visitEachChild(updatedSourceFile, visitNode, transformationContext)
			}
		}

		if (node && ts.isArrowFunction(node)) {
			if (ts.isVariableDeclaration(node.parent)) {
				const variableDeclaration = node.parent
				const functionName = variableDeclaration.name.getText()

				if (functionName.includes('__innerArrowFunction')) {
					return ts.visitEachChild(node, visitNode, transformationContext)
				}

				const fullName = `${sourceFile.fileName.slice(sourceFile.fileName.lastIndexOf('/') + 1)}::${functionName}:${
					sourceFile.getLineAndCharacterOfPosition(node.pos).line
				}`

				const isAsync = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
				return ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier('tenProfiler'),
						ts.factory.createIdentifier('wrapArrowFunction')
					),
					[],
					[
						ts.factory.createStringLiteral(fullName),
						isAsync ? ts.factory.createTrue() : ts.factory.createFalse(),
						ts.visitEachChild(node, visitNode, transformationContext),
					]
				)
			}
		}

		if (node && ts.isMethodDeclaration(node)) {
			const functionName = node.name.getText()

			if (!node.body) {
				return ts.visitEachChild(node, visitNode, transformationContext)
			}

			const fullName = `${sourceFile.fileName.slice(sourceFile.fileName.lastIndexOf('/') + 1)}::${functionName}:${
				sourceFile.getLineAndCharacterOfPosition(node.pos).line
			}`

			const statements = [...node.body.statements.entries()].map((a) => a[1])

			const isAsync = node.modifiers && node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
			const [createInnerArrowFunctionStatement, callInnerArrowFunctionStatement] = (() => {
				if (isAsync) {
					const createStatement = ts.factory.createVariableStatement(
						undefined,
						ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(
								'__innerArrowFunction',
								undefined,
								undefined,
								ts.factory.createArrowFunction(
									[ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
									[],
									[],
									undefined,
									undefined,
									ts.factory.createBlock(statements.slice())
								)
							),
						])
					)

					const callStatement = ts.factory.createVariableStatement(
						undefined,
						ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(
								'__innerReturnValue',
								undefined,
								undefined,
								ts.factory.createAwaitExpression(
									ts.factory.createCallExpression(ts.factory.createIdentifier('__innerArrowFunction'), [], [])
								)
							),
						])
					)
					return [createStatement, callStatement]
				} else {
					const createStatement = ts.factory.createVariableStatement(
						undefined,
						ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(
								'__innerArrowFunction',
								undefined,
								undefined,
								ts.factory.createArrowFunction([], [], [], undefined, undefined, ts.factory.createBlock(statements.slice()))
							),
						])
					)

					const callStatement = ts.factory.createVariableStatement(
						undefined,
						ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(
								'__innerReturnValue',
								undefined,
								undefined,
								ts.factory.createCallExpression(ts.factory.createIdentifier('__innerArrowFunction'), [], [])
							),
						])
					)
					return [createStatement, callStatement]
				}
			})()

			const returnStatement = ts.factory.createReturnStatement(ts.factory.createIdentifier('__innerReturnValue'))

			const startTimingStatement = ts.factory.createVariableStatement(
				undefined,
				ts.factory.createVariableDeclarationList([
					ts.factory.createVariableDeclaration(
						'__execTimeStart',
						undefined,
						undefined,
						ts.factory.createCallExpression(
							ts.factory.createPropertyAccessExpression(
								ts.factory.createIdentifier('tenProfiler'),
								ts.factory.createIdentifier('startTimingFunction')
							),
							[],
							[ts.factory.createStringLiteral(fullName)]
						)
					),
				])
			)

			const stopTimingStatement = ts.factory.createExpressionStatement(
				ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier('tenProfiler'),
						ts.factory.createIdentifier('stopTimingFunction')
					),
					[],
					[
						ts.factory.createStringLiteral(fullName),
						ts.factory.createIdentifier('__execTimeStart'),
						isAsync ? ts.factory.createTrue() : ts.factory.createFalse(),
					]
				)
			)

			statements.unshift(startTimingStatement)
			statements.push(stopTimingStatement)
			return ts.factory.createMethodDeclaration(
				node.decorators,
				node.modifiers,
				node.asteriskToken,
				node.name,
				node.questionToken,
				node.typeParameters,
				node.parameters,
				node.type,
				{
					...node.body,
					statements: ts.factory.createNodeArray(
						[
							startTimingStatement,
							createInnerArrowFunctionStatement,
							callInnerArrowFunctionStatement,
							stopTimingStatement,
							returnStatement,
						],
						node.body.statements.hasTrailingComma
					),
				}
			)
		}

		// if (node && typescript.isFunctionDeclaration(node)) {
		// 	const functionNode = node as typescript.SignatureDeclaration
		// 	const functionName = functionNode.name?.getText()

		// 	if (functionName) {
		// 		const variableAssignment = typescript.factory.createVariableDeclaration(
		// 			functionName,
		// 			undefined,
		// 			undefined,
		// 			typescript.factory.createCallExpression(
		// 				typescript.factory.createPropertyAccessExpression(
		// 					typescript.factory.createIdentifier('tenProfiler'),
		// 					typescript.factory.createIdentifier('wrapArrowFunction')
		// 				),
		// 				[],
		// 				[
		// 					typescript.factory.createStringLiteral(sourceFile.fileName),
		// 					typescript.factory.createStringLiteral(functionName),
		// 					typescript.factory.createIdentifier(functionName),
		// 				]
		// 			)
		// 		)

		// 		return [typescript.visitEachChild(node, visitNode, transformationContext), variableAssignment]
		// 	}
		// }

		return ts.visitEachChild(node, visitNode, transformationContext)
	}

	return ts.visitNode(sourceFile, visitNode)
}

export default transformer
