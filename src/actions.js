import { Regex } from '@companion-module/base'

export default function (self) {
	self.setActionDefinitions({
		instanceList: {
			name: 'Update Instance List',
			options: [
				{
					id: 'important-line',
					type: 'static-text',
					label: 'Note',
					value: 'Updates drop down lists of base models, custom models, engines, and instances',
				},
			],
			callback: async () => {
				await self.updateInstanceList()
			},
			subscribe: async () => {
				await self.updateInstanceList()
			},
		},
		instanceStart: {
			name: 'Start Instance',
			options: [
				{
					id: 'instance',
					type: 'dropdown',
					label: 'Instance',
					default: self.lexi?.instanceList[0]?.id ?? 'No available instances',
					choices: self.lexi?.instanceList ?? [],
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
				const instance = await context.parseVariablesInString(options.instance)
				const origin = await context.parseVariablesInString(options.init_origin)
				const reason = await context.parseVariablesInString(options.init_reason)
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Instance Start')
					return undefined
				}
				await self.queue.add(async () => {
					try {
						const response = await self.axios.post(
							`/live/v2/instances/${instance}/turn_on`,
							JSON.stringify({ initialization_origin: origin, initialization_reason: reason }),
							{ params: { get_history: 0 } },
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
					default: self.lexi?.instanceList[0]?.id ?? 'No available instances',
					choices: self.lexi?.instanceList ?? [],
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
						{ id: 'Scheduled End', label: 'Scheduled End' },
					],
				},
			],
			callback: async ({ options }, context) => {
				if (self.axios === undefined) {
					return undefined
				}
				const instance = await context.parseVariablesInString(options.instance)
				const origin = await context.parseVariablesInString(options.term_origin)
				const reason = await context.parseVariablesInString(options.term_reason)
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Instance Stop')
					return undefined
				}
				await self.queue.add(async () => {
					try {
						const response = await self.axios.post(
							`/live/v2/instances/${instance}/turn_off`,
							JSON.stringify({ termination_origin: origin, termination_reason: reason }),
							{ params: { get_history: 0 } },
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
					default: self.lexi?.instanceList[0]?.id ?? 'No available instances',
					choices: self.lexi?.instanceList ?? [],
					allowCustom: true,
					regex: Regex.SOMETHING,
					tooltip: 'Varible must return an instance id.',
				},
				{
					id: 'important-line',
					type: 'static-text',
					label: 'Note',
					value: 'Instance can not be modified while active.',
				},
				{
					id: 'parameters',
					type: 'multidropdown',
					label: 'Parameters',
					default: [],
					choices: [
						{ id: 'all_caps', label: 'All Caps' },
						{ id: 'applause_events', label: 'Applause Events' },
						{ id: 'audio_events', label: 'Audio Events' },
						{ id: 'base_model', label: 'Base Model' },
						{ id: 'base_row', label: 'Base Row' },
						{ id: 'cc_service', label: 'CC Service' },
						{ id: 'col_indent', label: 'Columns to Indent' },
						{ id: 'col_width', label: 'Column Width' },
						{ id: 'custom_model', label: 'Custom Model' },
						{ id: 'diarization_style', label: 'Diarization Style' },
						{ id: 'disfluency_filter', label: 'Disfluency Filter' },
						{ id: 'display_style', label: 'Display Style' },
						{ id: 'engine', label: 'Engine' },
						{ id: 'erase_screen', label: 'Erase Screen' },
						{ id: 'icapaccesscode', label: 'iCap Access Code' },
						{ id: 'max_delay', label: 'Max Delay' },
						{ id: 'num_channels_audio', label: 'Multi-Track: Number of Audio Channels' },
						{ id: 'speaker_label', label: 'Multi-Track: Speaker Labels' },
						{ id: 'music_events', label: 'Music Events' },
						{ id: 'laughter_events', label: 'Laughter Events' },
						{ id: 'lexiName', label: 'Name' },
						{ id: 'num_rows', label: 'Number of Caption Rows' },
						{ id: 'use_newfor', label: 'Output Mode (Use Newfor)' },
						{ id: 'profanity_filter', label: 'Profanity Filter' },
						{ id: 'teletext_page', label: 'Teletext Page' },
						{ id: 'timeout', label: 'Timeout' },
						{ id: 'vision_positioning', label: 'Vision Positioning' },
					],
					minSelection: 1,
					tooltip: 'Select parameters to modify',
				},
				{
					id: 'lexiName',
					type: 'textinput',
					label: 'Name',
					default: '',
					useVariables: { local: true },
					required: false,
					tooltip: 'The LEXI Live instance name',
					isVisible: (options) => {
						return options.parameters.includes('lexiName')
					},
				},
				{
					id: 'engine',
					type: 'dropdown',
					label: 'Engine',
					default: self.lexi.engines[0]?.id ?? 'No available engines',
					choices: self.lexi.engines ?? [],
					allowCustom: false,
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
					default: self.lexi.baseModels[0]?.id ?? 'No available language models',
					choices: self.lexi.baseModels ?? [],
					allowCustom: false,
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
					default: self.lexi.customModels[0]?.id ?? 'No available custom models',
					choices: self.lexi.customModels ?? [],
					allowCustom: false,
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
					id: 'cc_service',
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
					type: 'dropdown',
					label: 'Output Mode',
					default: false,
					choices: [
						{ id: false, label: '608/708' },
						{ id: true, label: 'Newfor/Teletext' },
					],
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
					id: 'erase_screen',
					type: 'checkbox',
					label: 'Erase Screen',
					default: false,
					tooltip: `Erase the screen when Lexi enters standby or is stopped`,
					isVisible: (options) => {
						return options.parameters.includes('erase_screen')
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
						{ id: '2', label: '2 (608/708 Only)' },
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
						{ id: '16', label: '16 (Newfor/Teletext Only)' },
						{ id: '17', label: '17 (Newfor/Teletext Only)' },
						{ id: '18', label: '18 (Newfor/Teletext Only)' },
						{ id: '19', label: '19 (Newfor/Teletext Only)' },
						{ id: '20', label: '20 (Newfor/Teletext Only)' },
						{ id: '21', label: '21 (Newfor/Teletext Only)' },
						{ id: '22', label: '22 (Newfor/Teletext Only)' },
						{ id: '23', label: '23 (Newfor/Teletext Only)' },
						{ id: '24', label: '24 (Newfor/Teletext Only)' },
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
						{ id: '0', label: '0' },
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
					],
					allowCustom: false,
					required: false,
					tooltip: 'The number of columns to indent from the left-hand side of screen.',
					isVisible: (options) => {
						return options.parameters.includes('col_indent')
					},
				},
				{
					id: 'col_width',
					type: 'dropdown',
					label: 'Column Width',
					default: '1',
					choices: [
						{ id: '16', label: '16 Characters' },
						{ id: '20', label: '20 Characters' },
						{ id: '24', label: '24 Characters' },
						{ id: '28', label: '28 Characters' },
						{ id: '32', label: '32 Characters' },
						{ id: '36', label: '36 Characters *' },
					],
					allowCustom: false,
					required: false,
					tooltip:
						'Set the amount of characters per row of text. * 36 character rows may not be compatible with North American broadcast workflows',
					isVisible: (options) => {
						return options.parameters.includes('col_width')
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
					type: 'dropdown',
					label: 'Timeout',
					default: 600,
					choices: [
						{ id: 600, label: '10 Minutes' },
						{ id: 1200, label: '20 Minutes' },
						{ id: 1800, label: '30 Minutes' },
						{ id: 2400, label: '40 Minutes' },
						{ id: 3000, label: '50 Minutes' },
						{ id: 3600, label: '60 Minutes' },
						{ id: -1, label: 'None' },
					],
					allowCustom: false,
					required: false,
					tooltip: 'Silence allowed before iCap will auto-terminate a job (to reduce billing charges).',
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
					id: 'disfluency_filter',
					type: 'checkbox',
					label: 'Disfluency Filter',
					default: false,
					tooltip: `Enable to filter out “um”, “uh”, “ah”, etc.`,
					isVisible: (options) => {
						return options.parameters.includes('disfluency_filter')
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
						{ id: '0', label: 'Off' },
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
						'Comma seperated array of strings to use as speaker identification labels. I.e. >> Fred:, >> Barney:. Should match the number of audio channels.',
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
						'Sets the maximum number of seconds between receiving audio input and producing CC output. Higher max_delay values may yield greater recognition accuracy. Values to use: 0.7 through 10',
					isVisible: (options) => {
						return options.parameters.includes('max_delay')
					},
				},
			],
			callback: async ({ options }, context) => {
				if (self.axios === undefined || options.parameters.length === 0) {
					return undefined
				}
				const instance = await context.parseVariablesInString(options.instance)
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Modfy Instance')
					return undefined
				}
				if (self.lexi.instanceState[instance] === 'ON') {
					self.log('warn', `Instance ${instance} is on, can not modify`)
					return undefined
				}
				const params = {}
				if (options.parameters.includes('lexiName')) {
					params.name = await context.parseVariablesInString(options.lexiName)
				}
				if (options.parameters.includes('engine')) {
					const engine = await context.parseVariablesInString(options.engine)
					if (engine !== 'No available engines' && engine !== '') {
						params.engine = engine
					} else {
						self.log('warn', `Invalid engine: ${engine}`)
					}
				}
				if (options.parameters.includes('base_model')) {
					const base_model = await context.parseVariablesInString(options.base_model)
					if (base_model !== 'No available language models' && base_model !== '') {
						params.base_model = base_model
					} else {
						self.log('warn', `Invalid base_model: ${base_model}`)
					}
				}
				if (options.parameters.includes('custom_model')) {
					const custom_model = await context.parseVariablesInString(options.custom_model)
					if (custom_model !== 'No available custom models' && custom_model !== '') {
						params.custom_model = custom_model
						params.custom_models = [custom_model]
					} else {
						self.log('warn', `Invalid custom_model: ${custom_model}`)
					}
				}
				if (options.parameters.includes('diarization_style')) {
					params.diarization_style = options.diarization_style
				}
				if (options.parameters.includes('audio_events')) {
					params.audio_events = options.audio_events
				}
				if (options.parameters.includes('music_events')) {
					params.music_events = options.music_events
				}
				if (options.parameters.includes('applause_events')) {
					params.applause_events = options.applause_events
				}
				if (options.parameters.includes('laughter_events')) {
					params.laughter_events = options.laughter_events
				}
				if (options.parameters.includes('cc_service')) {
					const cc_service = parseInt(await context.parseVariablesInString(options.cc_service))
					if (cc_service >= 1 && cc_service <= 6) {
						params.cc_service = cc_service.toString()
					} else {
						self.log('warn', `Invalid cc_service value: ${cc_service}`)
					}
				}
				if (options.parameters.includes('use_newfor')) {
					params.use_newfor = options.use_newfor
				}
				if (options.parameters.includes('teletext_page')) {
					const page = await context.parseVariablesInString(options.teletext_page)
					if (page.length === 3 && !isNaN(parseInt(page, 16))) {
						params.teletext_page = page
					} else {
						self.log('warn', `Invalid page, must have a length of 3: ${page}. Length: ${page.length}`)
					}
				}
				if (options.parameters.includes('display_style')) {
					params.display_style = options.display_style
				}
				if (options.parameters.includes('all_caps')) {
					params.all_caps = options.all_caps
				}
				if (options.parameters.includes('erase_screen')) {
					params.erase_screen = options.erase_screen.toString()
				}
				if (options.parameters.includes('num_rows')) {
					params.num_rows = options.num_rows
				}
				if (options.parameters.includes('base_row')) {
					params.base_row = options.base_row
				}
				if (options.parameters.includes('col_indent')) {
					params.col_indent = options.col_indent
				}
				if (options.parameters.includes('col_width')) {
					params.col_width = options.col_width
				}
				if (options.parameters.includes('icapaccesscode')) {
					params.icapaccesscode = await context.parseVariablesInString(options.icapaccesscode)
				}
				if (options.parameters.includes('timeout')) {
					params.timeout = options.timeout
				}
				if (options.parameters.includes('profanity_filter')) {
					params.profanity_filter = options.profanity_filter
				}
				if (options.parameters.includes('disfluency_filter')) {
					params.disfluency_filter = options.disfluency_filter.toString()
				}
				if (options.parameters.includes('vision_positioning')) {
					params.vision_positioning = options.vision_positioning
				}
				if (options.parameters.includes('num_channels_audio')) {
					params.num_channels_audio = options.num_channels_audio
				}
				if (options.parameters.includes('speaker_label')) {
					params.speaker_label = (await context.parseVariablesInString(options.speaker_label))
						.split(',')
						.map((label) => label.trim())
				}
				if (options.parameters.includes('max_delay')) {
					let delay = parseFloat(await context.parseVariablesInString(options.max_delay))
					if (!isNaN(delay)) {
						delay = delay < 0.7 ? 0.7 : delay > 10 ? 10 : delay
						params.max_delay = delay.toFixed(1)
					} else {
						self.log('warn', `Invalid delay value, must be a number. Value: ${delay} from ${options.max_delay}`)
					}
				}
				if (Object.keys(params).length === 0) {
					self.log('warn', `No valid parameters to modify on instance: ${instance}, action aborted`)
					return undefined
				}
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
				const instance = await context.parseVariablesInString(options.instance)
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Modify Instance - Learn')
					return undefined
				}
				const newSettings = self.learnInstanceSettings(instance)
				if (newSettings === undefined) return undefined
				return {
					...options,
					...newSettings,
				}
			},
		},
	})
}
