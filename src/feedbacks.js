import { combineRgb } from '@companion-module/base'

export default async function (self) {
	self.setFeedbackDefinitions({
		instanceState: {
			name: 'Instance State',
			type: 'boolean',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'ON',
					allowCustom: true,
					choices: [
						{ id: 'OFF', label: 'OFF' },
						{ id: 'ON', label: 'ON' },
					],
				},
			],
			callback: async (feedback, context) => {
				let instance = await context.parseVariablesInString(feedback.options.instance)
				let state = await context.parseVariablesInString(feedback.options.state)
				return self.lexi.instanceState[instance] == state
			},
		},
	})
}
