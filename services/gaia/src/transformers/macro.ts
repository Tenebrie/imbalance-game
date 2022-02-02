type MacroRecord = Record<string, string>

export const getTransformerMacros: () => MacroRecord = () => ({
	['##BuildTimestamp']: new Date().getTime().toString(),
})
