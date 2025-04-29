import { combineRgb } from '@companion-module/base'

const colours = {
	black: combineRgb(0, 0, 0),
	red: combineRgb(255, 0, 0),
}

const fbStyle = {
	bgcolor: colours.black,
	color: colours.red,
}

export default async function (self) {
	self.setFeedbackDefinitions({
		instanceState: {
			name: 'Instance State',
			type: 'boolean',
			defaultStyle: fbStyle,
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
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Instance State')
					return undefined
				}
				return self.lexi.instanceState[instance] == state
			},
		},
		instanceConfig: {
			name: 'Instance Configuration',
			type: 'boolean',
			defaultStyle: fbStyle,
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
					id: 'parameters',
					type: 'dropdown',
					label: 'Parameter',
					default: 'lexiName',
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
					allowCustom: false,
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
						return options.parameters == 'lexiName'
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
						return options.parameters == 'engine'
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
					tooltip: 'The base language model in use',
					isVisible: (options) => {
						return options.parameters == 'base_model'
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
					tooltip: 'The custom voice model in use',
					isVisible: (options) => {
						return options.parameters == 'custom_model'
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
					tooltip: 'The speaker change style in use. This setting is only available for the Lexi 3.0 engine.',
					isVisible: (options) => {
						return options.parameters == 'diarization_style'
					},
				},
				{
					id: 'audio_events',
					type: 'checkbox',
					label: 'Audio Events',
					default: true,
					tooltip: 'Identification of audio events in CC output.',
					isVisible: (options) => {
						return options.parameters == 'audio_events'
					},
				},
				{
					id: 'music_events',
					type: 'checkbox',
					label: 'Music Events',
					default: true,
					tooltip: 'Identification of music audio events in CC output.',
					isVisible: (options) => {
						return options.parameters == 'music_events'
					},
				},
				{
					id: 'applause_events',
					type: 'checkbox',
					label: 'Applause Events',
					default: true,
					tooltip: 'Identification of music applause audio events in CC output.',
					isVisible: (options) => {
						return options.parameters == 'applause_events'
					},
				},
				{
					id: 'laughter_events',
					type: 'checkbox',
					label: 'Laughter Events',
					default: true,
					tooltip: 'Enables identification of music laughter audio events in CC output.',
					isVisible: (options) => {
						return options.parameters == 'laughter_events'
					},
				},
				{
					id: 'cc_service',
					type: 'textinput',
					label: 'CC Service',
					default: '1',
					useVariables: { local: true },
					required: false,
					tooltip: 'The caption service in use (1 - 6).',
					isVisible: (options) => {
						return options.parameters == 'cc_service'
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
					isVisible: (options) => {
						return options.parameters == 'use_newfor'
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
						'The Teletext page number in use with the "Newfor/Teletext" output mode. In the format of: [magazine number][page number (tens)][page number (units)]',
					isVisible: (options) => {
						return options.parameters == 'teletext_page'
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
					tooltip: 'The caption advance style.',
					isVisible: (options) => {
						return options.parameters == 'display_style'
					},
				},
				{
					id: 'all_caps',
					type: 'checkbox',
					label: 'All Caps',
					default: false,
					tooltip: `Whether captions are rendered in ALL CAPS or sentence case.`,
					isVisible: (options) => {
						return options.parameters == 'all_caps'
					},
				},
				{
					id: 'erase_screen',
					type: 'checkbox',
					label: 'Erase Screen',
					default: false,
					tooltip: `Erase the screen when Lexi enters standby or is stopped`,
					isVisible: (options) => {
						return options.parameters == 'erase_screen'
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
					tooltip: 'The number of caption rows used in output captions.',
					isVisible: (options) => {
						return options.parameters == 'num_rows'
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
						return options.parameters == 'base_row'
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
					tooltip: 'The number of columns indented from the left-hand side of screen.',
					isVisible: (options) => {
						return options.parameters == 'col_indent'
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
					tooltip: 'The amount of characters per row of text.',
					isVisible: (options) => {
						return options.parameters == 'col_width'
					},
				},
				{
					id: 'icapaccesscode',
					type: 'textinput',
					label: 'iCap Access Code',
					default: '',
					useVariables: { local: true },
					required: false,
					tooltip: 'The iCap Access Code in use for caption delivery.',
					isVisible: (options) => {
						return options.parameters == 'icapaccesscode'
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
						return options.parameters == 'timeout'
					},
				},
				{
					id: 'profanity_filter',
					type: 'checkbox',
					label: 'Profanity Filter',
					default: false,
					isVisible: (options) => {
						return options.parameters == 'profanity_filter'
					},
				},
				{
					id: 'disfluency_filter',
					type: 'checkbox',
					label: 'Disfluency Filter',
					default: false,
					tooltip: `To filter out “um”, “uh”, “ah”, etc.`,
					isVisible: (options) => {
						return options.parameters == 'disfluency_filter'
					},
				},
				{
					id: 'vision_positioning',
					type: 'checkbox',
					label: 'Vision Positioning',
					default: false,
					tooltip: `A basic facial and text detector to attempt to keep captions from obscuring faces and Character Generator elements.`,
					isVisible: (options) => {
						return options.parameters == 'vision_positioning'
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
					tooltip: 'Number of discreet speaker feeds are being used for speaker identification.',
					isVisible: (options) => {
						return options.parameters == 'num_channels_audio'
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
						return options.parameters == 'speaker_label'
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
						'The maximum number of seconds between receiving audio input and producing CC output. Higher max_delay values may yield greater recognition accuracy. Values to use: 0.7 through 10',
					isVisible: (options) => {
						return options.parameters == 'max_delay'
					},
				},
				{
					id: 'important-line',
					type: 'static-text',
					label: 'Note',
					value: 'Some parameter values not reported by Lexi API when not in use.',
					isVisible: (options) => {
						const unreliableParams = [
							'teletext_page',
							'erase_screen',
							'music_events',
							'applause_events',
							'laughter_events',
						]
						return unreliableParams.includes(options.parameters)
					},
				},
			],
			callback: async (feedback, context) => {
				let instance = (await context.parseVariablesInString(feedback.options.instance)).trim()
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Instance State')
					return undefined
				}
				const instanceSettings = self.lexi.instances.get(instance)
				if (instanceSettings === undefined) return undefined
				let speakerLabel = ''
				if (Array.isArray(instanceSettings.speaker_label)) {
					for (let i = 0; i < instanceSettings.speaker_label.length; i++) {
						speakerLabel =
							speakerLabel === ''
								? instanceSettings.speaker_label[i]
								: speakerLabel + ', ' + instanceSettings.speaker_label[i]
					}
				} else {
					speakerLabel = instanceSettings.speaker_label
				}
				switch (feedback.options.parameters) {
					case 'lexiName':
						return instanceSettings.name == (await context.parseVariablesInString(feedback.options.lexiName)).trim()
					case 'engine':
						return instanceSettings.engine == (await context.parseVariablesInString(feedback.options.engine)).trim()
					case 'base_model':
						return (
							instanceSettings.base_model == (await context.parseVariablesInString(feedback.options.base_model)).trim()
						)
					case 'custom_model':
						return (
							instanceSettings.custom_model ==
							(await context.parseVariablesInString(feedback.options.custom_model)).trim()
						)
					case 'diarization_style':
						return instanceSettings.diarization_style == feedback.options.diarization_style
					case 'audio_events':
						return instanceSettings.audio_events == feedback.options.audio_events
					case 'music_events':
						return instanceSettings.music_events == feedback.options.music_events
					case 'applause_events':
						return instanceSettings.applause_events == feedback.options.applause_events
					case 'laughter_events':
						return instanceSettings.laughter_events == feedback.options.laughter_events
					case 'cc_service':
						return (
							instanceSettings.cc_service ==
							parseInt(await context.parseVariablesInString(feedback.options.cc_service)).toString()
						)
					case 'use_newfor':
						return instanceSettings.use_newfor == feedback.options.use_newfor
					case 'teletext_page':
						return (
							instanceSettings.teletext_page ==
							(await context.parseVariablesInString(feedback.options.teletext_page)).trim()
						)
					case 'display_style':
						return instanceSettings.display_style == feedback.options.display_style
					case 'all_caps':
						return instanceSettings.all_caps == feedback.options.all_caps
					case 'erase_screen':
						return instanceSettings.erase_screen == feedback.options.erase_screen.toString()
					case 'num_rows':
						return instanceSettings.num_rows == feedback.options.num_rows
					case 'base_row':
						return instanceSettings.base_row == feedback.options.base_row
					case 'col_indent':
						return instanceSettings.col_indent == feedback.options.col_indent
					case 'col_width':
						return instanceSettings.col_width == feedback.options.col_width
					case 'icapaccesscode':
						return (
							instanceSettings.icapaccesscode ==
							(await context.parseVariablesInString(feedback.options.icapaccesscode)).trim()
						)
					case 'timeout':
						return instanceSettings.timeout == feedback.options.timeout
					case 'profanity_filter':
						return instanceSettings.profanity_filter == feedback.options.profanity_filter
					case 'disfluency_filter':
						return instanceSettings.disfluency_filter == feedback.options.disfluency_filter
					case 'vision_positioning':
						return instanceSettings.vision_positioning == feedback.options.vision_positioning
					case 'num_channels_audio':
						return instanceSettings.num_channels_audio == feedback.options.num_channels_audio
					case 'speaker_label':
						return speakerLabel == (await context.parseVariablesInString(feedback.options.speaker_label)).trim()
					case 'max_delay':
						return (
							instanceSettings.max_delay ==
							parseFloat(await context.parseVariablesInString(feedback.options.max_delay)).toFixed(1)
						)
					default:
						return false
				}
			},
			learn: async ({ options }, context) => {
				const instance = await context.parseVariablesInString(options.instance)
				if (instance === undefined || instance === '' || instance === 'No available instances') {
					self.log('warn', 'No instance provided to Instance Configuration - Learn')
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
