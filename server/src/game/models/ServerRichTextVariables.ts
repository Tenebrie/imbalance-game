import ServerCard from './ServerCard'

type ServerRichTextVariables = {
	[index: string]: string | number | ((card: ServerCard) => (number | string | boolean))
}

export default ServerRichTextVariables
