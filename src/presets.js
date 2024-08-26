import { combineRgb } from '@companion-module/base'

export default async function (self) {
	let presets = {}
	self.lexi.instanceList.forEach((instance) => {
		presets[`start_${instance.id}`] = {
			type: 'button',
			category: 'Instance Control',
			name: `Start ${instance.label}`,
			style: {
				text: `Start\\n$(generic-module:instance_${instance.id})`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				show_topbar: 'default',
			},
			steps: [
				{
					down: [
						{
							actionId: 'instanceStart',
							options: {
								instance: instance.id,
								init_origin: self.origin_field,
								init_reason: 'User initialized',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'instanceState',
					options: {
						instance: instance.id,
						state: 'ON',
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 204, 0),
					},
				},
			],
		}
		presets[`stop_${instance.id}`] = {
			type: 'button',
			category: 'Instance Control',
			name: `Stop ${instance.label}`,
			style: {
				text: `Stop\\n$(generic-module:instance_${instance.id})`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				show_topbar: 'default',
			},
			steps: [
				{
					down: [
						{
							actionId: 'instanceStop',
							options: {
								instance: instance.id,
								term_origin: self.origin_field,
								term_reason: 'User initialized',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'instanceState',
					options: {
						instance: instance.id,
						state: 'OFF',
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	})
	self.setPresetDefinitions(presets)
}
