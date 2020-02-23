import ServerTargetDefinition from './ServerTargetDefinition'

export default interface TargetDefinitionBuilder {
	build(): ServerTargetDefinition
	merge(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder
}
