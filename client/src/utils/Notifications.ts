import Noty from 'noty'

const getBaseNotification = (text: string, type: Noty.Type) => {
	const noty = new Noty({ text: text, progressBar: true, layout: 'bottomLeft', type: type })
	noty.setTimeout(3000)
	return noty
}

export default {
	info(text: string): Noty {
		const noty = getBaseNotification(text, 'info')
		noty.show()
		return noty
	},

	success(text: string): Noty {
		const noty = getBaseNotification(text, 'success')
		noty.show()
		return noty
	},

	warning(text: string): Noty {
		const noty = getBaseNotification(text, 'warning')
		noty.show()
		return noty
	},

	error(text: string): Noty {
		const noty = getBaseNotification(text, 'error')
		noty.show()
		return noty
	}
}
