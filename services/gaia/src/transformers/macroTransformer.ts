import ts from 'typescript'

import { getTransformerMacros } from './macro'

const transformer = (_: ts.Program) => (transformationContext: ts.TransformationContext) => (sourceFile: ts.SourceFile): ts.Node => {
	const TransformerMacros = getTransformerMacros()

	function visitNode(node: ts.Node): ts.VisitResult<ts.Node> {
		if (sourceFile.fileName.includes('/transformers/')) {
			return ts.visitEachChild(node, visitNode, transformationContext)
		}

		if (node && ts.isStringLiteral(node) && TransformerMacros[node.text]) {
			return ts.visitEachChild(ts.factory.createStringLiteral(TransformerMacros[node.text]), visitNode, transformationContext)
		}

		return ts.visitEachChild(node, visitNode, transformationContext)
	}

	return ts.visitNode(sourceFile, visitNode)
}

export default transformer
