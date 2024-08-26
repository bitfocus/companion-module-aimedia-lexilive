import { Regex } from '@companion-module/base'

// Return config fields for web config
export function getConfigFields() {
	return [
		{
			type: 'textinput',
			id: 'user',
			label: 'Username',
			width: 4,
			regex: Regex.SOMETHING,
			default: '',
		},
		{
			type: 'textinput',
			id: 'pass',
			label: 'Password',
			width: 4,
			regex: Regex.SOMETHING,
			default: '',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Verbose Logging',
			width: 2,
			default: false,
			tooltip: 'Verbose logs written to the console. Logs include user credentials',
		},
	]
}
