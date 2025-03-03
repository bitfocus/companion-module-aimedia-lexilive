import { Regex } from '@companion-module/base'

export default function (self) {
	self.setActionDefinitions({
		instanceList: {
			name: 'Update Instance List',
			options: [],
			callback: async () => {
				await this.queue.add(async () => {
					self.updateInstanceList()
				})
			},
			subscribe: async () => {
				await this.queue.add(async () => {
					self.updateInstanceList()
				})
			},
		},
		instanceStart: {
			name: 'Start Instance',
			options: [
				{
					id: 'instance',
					type: 'dropdown',
					label: 'Instance',
					default: '',
					choices: self.lexi.instanceList,
					allowCustom: true,
					tooltip: 'Varible must return an instance id',
				},
				{
					id: 'init_origin',
					type: 'textinput',
					label: 'Initialization Origin',
					default: self.origin_field,
					useVariables: { local: true },
					required: false,
					tooltip: 'Appears in Lexi Logs',
				},
				{
					id: 'init_reason',
					type: 'dropdown',
					label: 'Initialization Reason',
					default: 'User initialized',
					allowCustom: true,
					tooltip: 'Appears in Lexi Logs',
					choices: [
						{ id: 'User initialized', label: 'User initialized' },
						{ id: 'Scheduled Start', label: 'Scheduled Start' },
					],
				},
			],
			callback: async ({ options }, context) => {
				if (self.axios === undefined) {
					return undefined
				}
				let instance = await context.parseVariablesInString(options.instance)
				let origin = await context.parseVariablesInString(options.init_origin)
				let reason = await context.parseVariablesInString(options.init_reason)
				if (instance === undefined) {
					self.log('warn', 'No instance provided to Instance Start')
					return undefined
				}
				await self.queue.add(async () => {
					try {
						const response = await self.axios.post(
							`/live/v2/instances/${instance}/turn_on`,
							JSON.stringify({ initialization_origin: origin, initialization_reason: reason }),
						)
						self.logResponse(response)
					} catch (error) {
						self.logError(error)
					}
				})
			},
		},
		instanceStop: {
			name: 'Stop Instance',
			options: [
				{
					id: 'instance',
					type: 'dropdown',
					label: 'Instance',
					default: '',
					choices: self.lexi.instanceList,
					allowCustom: true,
					regex: Regex.SOMETHING,
					tooltip: 'Varible must return an instance id',
				},
				{
					id: 'term_origin',
					type: 'textinput',
					label: 'Termination Origin',
					default: self.origin_field,
					useVariables: { local: true },
					required: false,
					tooltip: 'Appears in Lexi Logs',
				},
				{
					id: 'term_reason',
					type: 'dropdown',
					label: 'Termination Reason',
					default: 'User initialized',
					allowCustom: true,
					tooltip: 'Appears in Lexi Logs',
					choices: [
						{ id: 'User initialized', label: 'User initialized' },
						{ id: 'Scheduled Start', label: 'Scheduled End' },
					],
				},
			],
			callback: async ({ options }, context) => {
				if (self.axios === undefined) {
					return undefined
				}
				let instance = await context.parseVariablesInString(options.instance)
				let origin = await context.parseVariablesInString(options.term_origin)
				let reason = await context.parseVariablesInString(options.term_reason)
				if (instance === undefined) {
					self.log('warn', 'No instance provided to Instance Stop')
					return undefined
				}
				await self.queue.add(async () => {
					try {
						const response = await self.axios.post(
							`/live/v2/instances/${instance}/turn_off`,
							JSON.stringify({ termination_origin: origin, termination_reason: reason }),
						)
						self.logResponse(response)
					} catch (error) {
						self.logError(error)
					}
				})
			},
		},
	})
}
