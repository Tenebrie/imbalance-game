import bcrypt from 'bcrypt'

const passwordHashIterations = 4

export default {
	async hashPassword(plaintextPassword: string): Promise<string> {
		return bcrypt.hash(plaintextPassword, passwordHashIterations)
	},

	async passwordsMatch(plaintextPassword: string, hashedPassword: string): Promise<string> {
		if (!plaintextPassword || !hashedPassword) {
			console.error('HashManager: No password provided for comparison!')
		}
		return bcrypt.compare(plaintextPassword, hashedPassword)
	}
}
