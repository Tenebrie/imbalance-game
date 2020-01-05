import { exec } from 'child_process'

export default {
	exec(command: string): Promise<{ stdout: string, stderr: string }> {
		return new Promise(((resolve, reject) => {
			exec(command, (err, stdout, stderr) => {
				if (err) {
					reject(err)
				} else {
					resolve({ stdout, stderr })
				}
			})
		}))
	}
}
