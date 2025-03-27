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
					default: self.lexi.instanceList.find(() => true)?.id ?? 'No available instances',
					choices: self.lexi.instanceList ?? [],
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
				if (instance === undefined || instance === 'No available instances') {
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
					default: self.lexi.instanceList.find(() => true)?.id ?? 'No available instances',
					choices: self.lexi.instanceList ?? [],
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
				if (instance === undefined || instance === 'No available instances') {
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
		instanceModify: {
			name: 'Modify Instance',
			options: [
				{
					id: 'instance',
					type: 'dropdown',
					label: 'Instance',
					default: self.lexi.instanceList.find(() => true)?.id ?? 'No available instances',
					choices: self.lexi.instanceList ?? [],
					allowCustom: true,
					regex: Regex.SOMETHING,
					tooltip: 'Varible must return an instance id',
				},
				{
					id: 'parameters',
					type: 'multidropdown',
					label: 'Parameters',
					default: [],
					choices: [
						{ id: 'name', label: 'Name' },
						{ id: 'engine', label: 'Engine' },
						{ id: 'base_model', label: 'Base Model' },
						{ id: 'custom_model', label: 'Custom Model' },
						{ id: 'diarization_style', label: 'Diarization Style' },
						{ id: 'audio_events', label: 'Audio Events' },
						{ id: 'music_events', label: 'Music Events' },
						{ id: 'applause_events', label: 'Applause Events' },
						{ id: 'laughter_events', label: 'Laughter Events' },
						{ id: 'cc_service', label: 'CC Service' },
						{ id: 'use_newfor', label: 'Use Newfor' },
						{ id: 'teletext_page', label: 'Teletext Page' },
						{ id: 'display_style', label: 'Display Style' },
						{ id: 'all_caps', label: 'All Caps' },
						{ id: 'num_rows', label: 'Number of Caption Rows' },
						{ id: 'base_row', label: 'Base Row' },
						{ id: 'col_indent', label: 'Columns to Indent' },
						{ id: 'icapaccesscode', label: 'iCap Access Code' },
						{ id: 'timeout', label: 'Timeout' },
						{ id: 'profanity_filter', label: 'Profanity Filter' },
						{ id: 'vision_positioning', label: 'Vision Positioning' },
						{ id: 'num_channels_audio', label: 'Number of Audio Channels' },
						{ id: 'speaker_label', label: 'Speaker Labels' },
						{ id: 'max_delay', label: 'Max Delay' },
					],
					minSelection: 1,
					tooltip: 'Select parameters to modify',
				},
				{
					id: 'name',
					type: 'textinput',
					label: 'Name',
					default: '',
					useVariables: { local: true },
					required: false,
					tooltip: 'The LEXI Live instance name',
					isVisible: (options) => {
						return options.parameters.includes('name')
					},
				},
				{
					id: 'engine',
					type: 'dropdown',
					label: 'Engine',
					default: self.lexi.engineList.find(() => true)?.id ?? 'No available engines',
					choices: self.lexi.engineList ?? [],
					allowCustom: true,
					required: false,
					tooltip: 'The LEXI Live engine name',
					isVisible: (options) => {
						return options.parameters.includes('engine')
					},
				},
				{
					id: 'base_model',
					type: 'dropdown',
					label: 'Base Model',
					default: self.lexi.baseModel.find(() => true)?.id ?? 'No available language models',
					choices: self.lexi.baseModel ?? [],
					allowCustom: true,
					required: false,
					tooltip: 'The base language model to use',
					isVisible: (options) => {
						return options.parameters.includes('base_model')
					},
				},
				{
					id: 'custom_model',
					type: 'dropdown',
					label: 'Custom Model',
					default: self.lexi.customModel.find(() => true)?.id ?? 'No available custom models',
					choices: self.lexi.customModel ?? [],
					allowCustom: true,
					required: false,
					tooltip: 'The custom voice model to use',
					isVisible: (options) => {
						return options.parameters.includes('custom_model')
					},
				},
				{
					id: 'diarization_style',
					type: 'dropdown',
					label: 'Diarization Style',
					default: 'CHEVRON_NEWLINE',
					choices: [
						{ id: 'COLOR_CHANGE', label: 'Color Change' },
						{ id: 'CHEVRON_NEWLINE', label: 'Chevron Newline' },
						{ id: 'DASH_NEWLINE', label: 'Dash Newline' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'The speaker change style to use. This setting is only available for the Lexi 3.0 engine.',
					isVisible: (options) => {
						return options.parameters.includes('diarization_style')
					},
				},
				{
					id: 'audio_events',
					type: 'checkbox',
					label: 'Audio Events',
					default: true,
					tooltip: 'Enables identification of audio events in CC output.',
					isVisible: (options) => {
						return options.parameters.includes('audio_events')
					},
				},
				{
					id: 'music_events',
					type: 'checkbox',
					label: 'Music Events',
					default: true,
					tooltip: 'Enables identification of music audio events in CC output.',
					isVisible: (options) => {
						return options.parameters.includes('music_events')
					},
				},
				{
					id: 'applause_events',
					type: 'checkbox',
					label: 'Applause Events',
					default: true,
					tooltip: 'Enables identification of music applause audio events in CC output.',
					isVisible: (options) => {
						return options.parameters.includes('applause_events')
					},
				},
				{
					id: 'laughter_events',
					type: 'checkbox',
					label: 'Laughter Events',
					default: true,
					tooltip: 'Enables identification of music laughter audio events in CC output.',
					isVisible: (options) => {
						return options.parameters.includes('laughter_events')
					},
				},
				{
					id: 'name',
					type: 'textinput',
					label: 'CC Service',
					default: '1',
					useVariables: { local: true },
					required: false,
					tooltip: 'The caption service to use (1 - 6).',
					isVisible: (options) => {
						return options.parameters.includes('cc_service')
					},
				},
				{
					id: 'use_newfor',
					type: 'checkbox',
					label: 'Use Newfor',
					default: false,
					tooltip: `Engages the "Newfor/Teletext" output mode. If not specified, the default output mode is "608/708". Please choose in accordance with your caption encoder's "CC Output Format" setting, as well as the international region in which your content will be viewed.`,
					isVisible: (options) => {
						return options.parameters.includes('use_newfor')
					},
				},
				{
					id: 'teletext_page',
					type: 'textinput',
					label: 'Teletext Page',
					default: '801',
					useVariables: { local: true },
					required: false,
					tooltip:
						'The Teletext page number to be used with the "Newfor/Teletext" output mode. In the format of: [magazine number][page number (tens)][page number (units)]',
					isVisible: (options) => {
						return options.parameters.includes('teletext_page')
					},
				},
				{
					id: 'display_style',
					type: 'dropdown',
					label: 'Display Style',
					default: 'rollup',
					choices: [
						{ id: 'rollup', label: 'Roll-Up' },
						{ id: 'popon', label: 'Pop-On' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'Determines the caption advance style.',
					isVisible: (options) => {
						return options.parameters.includes('display_style')
					},
				},
				{
					id: 'all_caps',
					type: 'checkbox',
					label: 'All Caps',
					default: false,
					tooltip: `Whether captions should be rendered in ALL CAPS or sentence case.`,
					isVisible: (options) => {
						return options.parameters.includes('all_caps')
					},
				},
				{
					id: 'num_rows',
					type: 'dropdown',
					label: 'Number of Caption Rows',
					default: '2',
					choices: [
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'The number of caption rows to use in output captions.',
					isVisible: (options) => {
						return options.parameters.includes('num_rows')
					},
				},
				{
					id: 'base_row',
					type: 'dropdown',
					label: 'Base Row',
					default: '13',
					choices: [
						{ id: '1', label: '1 (Top)' },
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
						{ id: '5', label: '5' },
						{ id: '6', label: '6' },
						{ id: '7', label: '7' },
						{ id: '8', label: '8' },
						{ id: '9', label: '9' },
						{ id: '10', label: '10' },
						{ id: '11', label: '11' },
						{ id: '12', label: '12' },
						{ id: '13', label: '13' },
						{ id: '14', label: '14' },
						{ id: '15', label: '15 (Bottom)' },
					],
					allowCustom: false,
					required: false,
					tooltip:
						'The base caption row for display. Please note that the base row will be the maximum of this value and "num_rows".',
					isVisible: (options) => {
						return options.parameters.includes('base_row')
					},
				},
				{
					id: 'col_indent',
					type: 'dropdown',
					label: 'Columns to Indent',
					default: '1',
					choices: [
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
						{ id: '5', label: '5' },
						{ id: '6', label: '6' },
						{ id: '7', label: '7' },
						{ id: '8', label: '8' },
						{ id: '9', label: '9' },
						{ id: '10', label: '10' },
						{ id: '11', label: '11' },
						{ id: '12', label: '12' },
						{ id: '13', label: '13' },
						{ id: '14', label: '14' },
						{ id: '15', label: '15' },
						{ id: '16', label: '16' },
						{ id: '17', label: '17' },
						{ id: '18', label: '18' },
						{ id: '19', label: '19' },
						{ id: '20', label: '20' },
						{ id: '21', label: '21' },
						{ id: '22', label: '22' },
						{ id: '23', label: '23' },
						{ id: '24', label: '24' },
						{ id: '25', label: '25' },
						{ id: '26', label: '26' },
						{ id: '27', label: '27' },
						{ id: '28', label: '28' },
						{ id: '29', label: '29' },
						{ id: '30', label: '30' },
						{ id: '31', label: '31' },
						{ id: '32', label: '32' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'The number of columns to indent from the left-hand side of screen.',
					isVisible: (options) => {
						return options.parameters.includes('col_indent')
					},
				},
				{
					id: 'icapaccesscode',
					type: 'textinput',
					label: 'iCap Access Code',
					default: '',
					useVariables: { local: true },
					required: false,
					tooltip: 'The iCap Access Code to use for caption delivery.',
					isVisible: (options) => {
						return options.parameters.includes('icapaccesscode')
					},
				},
				{
					id: 'timeout',
					type: 'textinput',
					label: 'Timeout',
					default: '-1',
					useVariables: { local: true },
					required: false,
					tooltip:
						'The number of seconds (integer value) of silence allowed before iCap will auto-terminate a job (to reduce billing charges).',
					isVisible: (options) => {
						return options.parameters.includes('timeout')
					},
				},
				{
					id: 'profanity_filter',
					type: 'checkbox',
					label: 'Profanity Filter',
					default: false,
					tooltip: `Engages a basic profanity filter.`,
					isVisible: (options) => {
						return options.parameters.includes('profanity_filter')
					},
				},
				{
					id: 'vision_positioning',
					type: 'checkbox',
					label: 'Vision Positioning',
					default: false,
					tooltip: `Engages a basic facial and text detector to attempt to keep captions from obscuring faces and Character Generator elements.`,
					isVisible: (options) => {
						return options.parameters.includes('vision_positioning')
					},
				},
				{
					id: 'num_channels_audio',
					type: 'dropdown',
					label: 'Number of Audio Channels',
					default: '2',
					choices: [
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
						{ id: '5', label: '5' },
						{ id: '6', label: '6' },
						{ id: '7', label: '7' },
						{ id: '8', label: '8' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'Sets number of discreet speaker feeds are being used for speaker identification.',
					isVisible: (options) => {
						return options.parameters.includes('num_channels_audio')
					},
				},
				{
					id: 'speaker_label',
					type: 'textinput',
					label: 'Speaker Labels',
					default: '',
					useVariables: { local: true },
					required: false,
					tooltip:
						'Comma seperated array of strings to use as speaker identification labels. I.e. >> Fred:, >> Barney:',
					isVisible: (options) => {
						return options.parameters.includes('speaker_label')
					},
				},
				{
					id: 'max_delay',
					type: 'textinput',
					label: 'Maximum Delay',
					default: '3',
					useVariables: { local: true },
					required: false,
					tooltip:
						'Sets she maximum number of seconds between receiving audio input and producing CC output. Higher max_delay values may yield greater recognition accuracy. Values to use: 0.7 through 10',
					isVisible: (options) => {
						return options.parameters.includes('max_delay')
					},
				},
			],
			callback: async ({ options }, context) => {
				if (self.axios === undefined) {
					return undefined
				}
				let instance = await context.parseVariablesInString(options.instance)
				if (instance === undefined || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Modfy Instance')
					return undefined
				}
				if (options.parameters.length === 0) return //nothig selected
				const params = {}
				if (options.parameters.includes('name')) {
					params.name = await context.parseVariablesInString(options.name)
				}
				if (options.parameters.includes('engine')) {
					const engine = await context.parseVariablesInString(options.engine)
					if (engine !== 'No available engines') params.engine = engine
				}
				if (options.parameters.includes('base_model')) {
					const base_model = await context.parseVariablesInString(options.base_model)
					if (base_model !== 'No available language models') params.base_model = base_model
				}
				if (options.parameters.includes('custom_model')) {
					const custom_model = await context.parseVariablesInString(options.custom_model)
					if (custom_model !== 'No available custom models') params.custom_model = custom_model
				}
				if (options.parameters.includes('diarization_style')) {
					params.diarization_style = String(options.diarization_style)
				}
				if (options.parameters.includes('audio_events')) {
					params.audio_events = options.audio_events.toString()
				}
				if (options.parameters.includes('music_events')) {
					params.music_events = options.music_events.toString()
				}
				if (options.parameters.includes('applause_events')) {
					params.applause_events = options.applause_events.toString()
				}
				if (options.parameters.includes('laughter_events')) {
					params.laughter_events = options.laughter_events.toString()
				}
				if (options.parameters.includes('cc_service')) {
					const cc_service = parseInt(await context.parseVariablesInString(options.cc_service))
					if (cc_service >= 1 && cc_service <= 6) params.cc_service = cc_service.toString()
				}
				if (options.parameters.includes('use_newfor')) {
					params.use_newfor = options.use_newfor.toString()
				}
				if (options.parameters.includes('teletext_page')) {
					const page = parseInt(await context.parseVariablesInString(options.teletext_page))
					if (!isNaN(page) && page >= 100 && page <= 999) params.teletext_page = page.toString()
				}
				if (options.parameters.includes('display_style')) {
					params.display_style = String(options.display_style)
				}
				if (options.parameters.includes('all_caps')) {
					params.all_caps = options.all_caps.toString()
				}
				if (options.parameters.includes('num_rows')) {
					params.num_rows = String(options.num_rows)
				}
				if (options.parameters.includes('base_row')) {
					params.base_row = String(options.base_row)
				}
				if (options.parameters.includes('col_indent')) {
					params.col_indent = String(options.col_indent)
				}
				if (options.parameters.includes('icapaccesscode')) {
					params.icapaccesscode = await context.parseVariablesInString(options.icapaccesscode)
				}
				if (options.parameters.includes('timeout')) {
					const timeout = parseInt(await context.parseVariablesInString(options.timeout))
					if (!isNaN(timeout) && timeout >= -1) params.timeout = timeout
				}
				if (options.parameters.includes('profanity_filter')) {
					params.profanity_filter = options.profanity_filter.toString()
				}
				if (options.parameters.includes('vision_positioning')) {
					params.vision_positioning = options.vision_positioning.toString()
				}
				if (options.parameters.includes('num_channels_audio')) {
					params.num_channels_audio = String(options.num_channels_audio)
				}
				if (options.parameters.includes('speaker_label')) {
					params.speaker_label = (await context.parseVariablesInString(options.speaker_label)).split(',')
				}
				if (options.parameters.includes('max_delay')) {
					const delay = parseFloat(await context.parseVariablesInString(options.max_delay)).toFixed(1)
					if (!isNaN(delay) && delay >= 0.7 && delay <= 10) params.max_delay = delay.toString()
				}
				if (Object.keys(params).length === 0) return
				await self.queue.add(async () => {
					try {
						const response = await self.axios.patch(`/live/v2/instances/${instance}`, JSON.stringify(params))
						self.logResponse(response)
					} catch (error) {
						self.logError(error)
					}
				})
			},
			learn: async ({ options }, context) => {
				if (self.axios === undefined) {
					return undefined
				}
				let instance = await context.parseVariablesInString(options.instance)
				if (instance === undefined || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Modify Instance')
					return undefined
				}

				await self.queue.add(async () => {
					try {
						const response = await self.axios.get(`/live/v2/instances/${instance}`, JSON.stringify({ get_history: 0 }))
						self.logResponse(response)
						return {
							...options,
							name: response.settings.name ?? options.name,
							engine: response.settings.engine ?? options.engine,
							base_model: response.settings.base_model ?? options.base_model,
							custom_model: response.settings.custom_model ?? options.custom_model,
							diarization_style: response.settings.diarization_style ?? options.diarization_style,
						}
					} catch (error) {
						self.logError(error)
						return undefined
					}
				})
			},
		},
	})
}
