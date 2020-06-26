import Noty from 'noty'

const getBaseNotification = (text: string, type: Noty.Type) => {
	const noty = new Noty({ text: text, progressBar: true, layout: 'bottomLeft', type: type })
	return noty
}

export default {
	info(text: string): Noty {
		const noty = getBaseNotification(text, 'info')
		noty.setTimeout(2000)
		noty.show()
		return noty
	},

	success(text: string): Noty {
		const noty = getBaseNotification(text, 'success')
		noty.setTimeout(2000)
		noty.show()
		return noty
	},

	warning(text: string): Noty {
		const noty = getBaseNotification(text, 'warning')
		noty.setTimeout(3000)
		noty.show()
		return noty
	},

	error(text: string): Noty {
		const noty = getBaseNotification(text, 'error')
		noty.setTimeout(5000)
		noty.show()
		return noty
	}
}
