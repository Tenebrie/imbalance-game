import AsyncHandler from '../utils/AsyncHandler'

export default AsyncHandler(async (req, res, next) => {
	const token = req.cookies['playerToken']
	if (!token) { throw 'Missing token' }

	const player = await global.playerLibrary.getPlayerByJwtToken(token)
	if (!player) { throw 'Token invalid' }

	res.cookie('playerToken', token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })

	req['player'] = player
	next()
})
