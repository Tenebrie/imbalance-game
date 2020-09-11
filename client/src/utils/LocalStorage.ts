enum LocalStorageKey {
	hasAuthCookie = 'isAuthCookiePresent'
}

export default {
	setHasAuthCookie(value: boolean): void {
		localStorage.setItem(LocalStorageKey.hasAuthCookie, String(value))
	},

	hasAuthCookie(): boolean {
		return localStorage.getItem(LocalStorageKey.hasAuthCookie) === 'true'
	}
}
