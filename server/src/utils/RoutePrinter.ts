import { Application } from 'express'
import RequirePlayerTokenMiddleware from '@src/middleware/RequirePlayerTokenMiddleware'
import RequireSupportAccessLevelMiddleware from '@src/middleware/RequireSupportAccessLevelMiddleware'
import RequireAdminAccessLevelMiddleware from '@src/middleware/RequireAdminAccessLevelMiddleware'
import { colorize, colorizeId } from '@src/utils/Utils'
import AsciiColor from '@src/enums/AsciiColor'
import AccessLevel from '@shared/enums/AccessLevel'
import RequireDevAdminAccessLevelMiddleware from '@src/middleware/RequireDevAdminAccessLevelMiddleware'

/*
 * Hey there, thanks for coming over.
 * So, uhm, this code right here. It's not great. It's not good. It's pretty much unreadable. Just trust me it works fine, alright?
 * It will take the entire Express app and spit out a nicely formatted string with all routes and their respective access levels.
 * Although it will ignore stuff outside of routers.
 *
 * Brace yourself if you want to actually read it.
 */

export const printAllRoutes = (app: Application): string => {
	const allRouters = app._router.stack
		.filter((layer: { name: string }) => layer.name === 'router')
		.map((layer: { handle: { stack: any }; regexp: { toString: () => string } }) => {
			const middleware = app._router.stack
				.slice(0, app._router.stack.indexOf(layer))
				.filter((wareLayer: { name: string }) => wareLayer.name !== 'serveStatic' && wareLayer.name !== 'router')
				.map((wareLayer: { name: string; handle: { stack: any } }) => ({
					name: wareLayer.name,
					handle: wareLayer.handle.stack,
				}))
			return {
				stack: layer.handle.stack,
				middleware,
				path: layer.regexp.toString().substring(3, layer.regexp.toString().indexOf('/?')).replace(/\\/g, ''),
			}
		})

	enum MiddlewareType {
		PLAYER_TOKEN = 'player_token',
		SUPPORT_TOKEN = 'support_token',
		ADMIN_TOKEN = 'admin_token',
		DEVELOPER_TOKEN = 'developer_token',
		UNKNOWN = 'unknown',
	}

	const allRoutes = allRouters
		.map((router: { stack: any[]; middleware: any; path: string }) => {
			return router.stack
				.filter((layer) => !!layer.route)
				.map((layer) => {
					const middleware = [
						...router.middleware,
						...router.stack.slice(0, router.stack.indexOf(layer)).map((wareLayer) => ({
							name: wareLayer.name,
							handle: wareLayer.handle,
						})),
					]
						.map((middleware) => {
							switch (middleware.handle) {
								case RequirePlayerTokenMiddleware:
									return MiddlewareType.PLAYER_TOKEN
								case RequireSupportAccessLevelMiddleware:
									return MiddlewareType.SUPPORT_TOKEN
								case RequireAdminAccessLevelMiddleware:
									return MiddlewareType.ADMIN_TOKEN
								case RequireDevAdminAccessLevelMiddleware:
									return MiddlewareType.DEVELOPER_TOKEN
								default:
									return MiddlewareType.UNKNOWN
							}
						})
						.filter((middleware) => middleware !== MiddlewareType.UNKNOWN)
					return {
						path: layer.route.path.length > 1 ? `${router.path}${layer.route.path}` : router.path,
						accessLevelString: middleware.includes(MiddlewareType.DEVELOPER_TOKEN)
							? `[${colorize('Developer', AsciiColor.MAGENTA)}]`
							: middleware.includes(MiddlewareType.ADMIN_TOKEN)
							? `[${colorize('Admin', AsciiColor.RED)}]`
							: middleware.includes(MiddlewareType.SUPPORT_TOKEN)
							? `[${colorize('Support', AsciiColor.YELLOW)}]`
							: middleware.includes(MiddlewareType.PLAYER_TOKEN)
							? `[${colorize('Player', AsciiColor.BLUE)}]`
							: `[${colorize('Any', AsciiColor.WHITE)}]`,
						accessLevel: middleware.includes(MiddlewareType.DEVELOPER_TOKEN)
							? AccessLevel.DEVELOPER
							: middleware.includes(MiddlewareType.ADMIN_TOKEN)
							? AccessLevel.ADMIN
							: middleware.includes(MiddlewareType.SUPPORT_TOKEN)
							? AccessLevel.SUPPORT
							: middleware.includes(MiddlewareType.PLAYER_TOKEN)
							? AccessLevel.NORMAL
							: AccessLevel.DISABLED,
						methods: Object.keys(layer.route.methods).map((key) => key.toUpperCase()),
					}
				})
		})
		.flat(1)
		.sort((a: { accessLevel: AccessLevel }, b: { accessLevel: AccessLevel }) => {
			return Object.values(AccessLevel).indexOf(a.accessLevel) - Object.values(AccessLevel).indexOf(b.accessLevel)
		})
		.reduce(
			(
				list: { path: string; accessLevel: AccessLevel; methods: string[] }[],
				value: { path: string; accessLevel: AccessLevel; methods: string[] }
			) => {
				const duplicatedItem = list.find((item) => item.path === value.path && item.accessLevel === value.accessLevel)
				if (duplicatedItem) {
					duplicatedItem.methods = duplicatedItem.methods.concat(value.methods)
					return list
				} else {
					return list.concat(value)
				}
			},
			[]
		)
		.map((value: { accessLevelString: string; methods: string[]; path: string }) => ({
			accessLevel: value.accessLevelString,
			method: colorize(value.methods.join('|'), AsciiColor.GREEN),
			path: colorizeId(value.path),
		}))

	const methodPadding = allRoutes.slice().sort((a: { method: string }, b: { method: string }) => b.method.length - a.method.length)[0]
		.method.length
	const accessLevelPadding = allRoutes
		.slice()
		.sort((a: { accessLevel: string }, b: { accessLevel: string }) => b.accessLevel.length - a.accessLevel.length)[0].accessLevel.length

	const getSpaces = (baseValue: string, padTo: number): string => {
		let spaces = ''
		for (let i = baseValue.length; i < padTo; i++) {
			spaces += ' '
		}
		return spaces
	}

	return (
		allRoutes
			.map((value: { path: string; method: string; accessLevel: string }) => {
				const path = value.path
				const method = value.method
				const accessLevel = value.accessLevel
				return `${accessLevel} ${getSpaces(accessLevel, accessLevelPadding)} ${method} ${getSpaces(method, methodPadding)} ${path}`
			})
			.reduce((output: string, value: string) => {
				const comma = () => {
					return output.length > 1 ? ',' : ''
				}
				return `${output}${comma()}\n  ${value}`
			}, '[') + '\n]'
	)
}
