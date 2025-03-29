export async function getEngines() {
	if (this.axios === undefined) {
		return undefined
	}
	try {
		const response = await this.queue.add(async () => {
			return await this.axios.get('/live/v2/engines')
		})
		this.logResponse(response)
		if (response.data === undefined) {
			this.log('warn', 'getEngines response contains no data')
			return undefined
		}
		//this.log('info', `Engines: ${JSON.stringify(response.data)}`)
		if (Array.isArray(response.data.engines)) {
			this.lexi.engines = []
			response.data.engines.forEach((engine) => {
				if (engine.name !== undefined) {
					this.lexi.engines.push({ id: engine.name, label: engine?.display_name ?? engine.name })
				}
			})
		}
		return response.data
	} catch (error) {
		this.logError(error)
		return undefined
	}
}

export async function getBaseModels() {
	if (this.axios === undefined) {
		return undefined
	}
	try {
		const response = await this.queue.add(async () => {
			return await this.axios.get('/base_models')
		})
		this.logResponse(response)
		if (response.data === undefined) {
			this.log('warn', 'getBaseModels response contains no data')
			return undefined
		}
		const modelKeys = Object.keys(response.data.models)
		if (modelKeys.length > 0) this.lexi.baseModels = []
		modelKeys.forEach((model) => {
			if (response.data.models[model].base_model_name !== undefined) {
				this.lexi.baseModels.push({
					id: response.data.models[model].base_model_name,
					label: response.data.models[model].display_name ?? response.data.models[model].base_model_name,
				})
			}
		})
		//this.log('info', `Base Models: ${JSON.stringify(response.data)}`)
		return response.data
	} catch (error) {
		this.logError(error)
		return undefined
	}
}

export async function getCustomModels() {
	if (this.axios === undefined) {
		return undefined
	}
	try {
		const response = await this.queue.add(async () => {
			return await this.axios.get('/models/v3')
		})
		this.logResponse(response)
		if (response.data === undefined) {
			this.log('warn', 'getCustomModels response contains no data')
			return undefined
		}
		//this.log('info', `Custom Models: ${JSON.stringify(response.data)}`)
		if (Array.isArray(response.data.models)) {
			this.lexi.customModels = []
			response.data.models.forEach((model) => {
				if (model.modelID !== undefined) {
					let displayName = model.model_name
					if (model?.global_language?.display_name) displayName += ` (${model?.global_language?.display_name})`
					this.lexi.customModels.push({ id: model.modelID, label: displayName })
				}
			})
		}
		return response.data
	} catch (error) {
		this.logError(error)
		return undefined
	}
}

export async function getInstances() {
	if (this.axios === undefined) {
		return undefined
	}
	try {
		const response = await this.queue.add(async () => {
			return await this.axios.get('/live/v2/instances', { params: { get_history: 0 } })
		})
		this.logResponse(response)
		if (response.data === undefined) {
			this.log('warn', 'getInstances response contains no data')
			return undefined
		}
		let instances = response.data.all_instances
		this.lexi.instanceList = []
		this.lexi.instanceVariables = []
		instances.forEach((instance) => {
			if (instance.instance_id !== undefined) {
				this.lexi.instanceState[instance.instance_id] = instance.state
				this.lexi.instanceList.push({ id: instance.instance_id, label: instance.settings.name })
				this.updateInstanceSettings(instance.instance_id, instance.settings)
				this.lexi.instanceVariables.push({
					variableId: `instance_${instance.instance_id}`,
					name: `${instance.instance_id} Name`,
				})
				this.lexi.instanceNames[`instance_${instance.instance_id}`] = instance.settings.name
			}
		})
		this.checkFeedbacks()
		return this.lexi.instanceList
	} catch (error) {
		this.logError(error)
		return undefined
	}
}

export async function updateInstanceList() {
	await this.getInstances()
	await this.getEngines()
	await this.getBaseModels()
	await this.getCustomModels()
	this.updateActions() // export actions
	this.updateFeedbacks() // export feedback
	this.updateVariableDefinitions()
	this.setVariableValues(this.lexi.instanceNames)
	this.updatePresetsDefinitions()
}

export function learnInstanceSettings(instance) {
	const instanceSettings = this.lexi.instances.get(instance)
	if (instanceSettings === undefined) return undefined
	const newSettings = {}
	if (instanceSettings.all_caps !== undefined) newSettings.all_caps = instanceSettings.all_caps
	if (instanceSettings.applause_events !== undefined) newSettings.applause_events = instanceSettings.applause_events
	if (instanceSettings.audio_events !== undefined) newSettings.audio_events = instanceSettings.audio_events
	if (instanceSettings.base_model !== undefined) newSettings.base_model = instanceSettings.base_model
	if (instanceSettings.base_row !== undefined) newSettings.base_row = instanceSettings.base_row
	if (instanceSettings.cc_service !== undefined) newSettings.cc_service = instanceSettings.cc_service
	if (instanceSettings.col_indent !== undefined) newSettings.col_indent = instanceSettings.col_indent
	if (instanceSettings.col_width !== undefined) newSettings.col_width = instanceSettings.col_width
	if (instanceSettings.custom_model !== undefined) newSettings.custom_model = instanceSettings.custom_model
	if (instanceSettings.diarization_style !== undefined)
		newSettings.diarization_style = instanceSettings.diarization_style
	if (instanceSettings.disfluency_filter !== undefined)
		newSettings.disfluency_filter = instanceSettings.disfluency_filter
	if (instanceSettings.display_style !== undefined) newSettings.display_style = instanceSettings.display_style
	if (instanceSettings.engine !== undefined) newSettings.engine = instanceSettings.engine
	if (instanceSettings.erase_screen !== undefined)
		newSettings.erase_screen = instanceSettings.erase_screen === 'true' || instanceSettings.erase_screen === true
	if (instanceSettings.icapaccesscode !== undefined) newSettings.icapaccesscode = instanceSettings.icapaccesscode
	if (instanceSettings.laughter_events !== undefined) newSettings.laughter_events = instanceSettings.laughter_events
	if (instanceSettings.max_delay !== undefined) newSettings.max_delay = instanceSettings.max_delay
	if (instanceSettings.music_events !== undefined) newSettings.music_events = instanceSettings.music_events
	if (instanceSettings.name !== undefined) newSettings.lexiName = instanceSettings.name
	if (instanceSettings.num_channels_audio !== undefined)
		newSettings.num_channels_audio = instanceSettings.num_channels_audio
	if (instanceSettings.num_rows !== undefined) newSettings.num_rows = instanceSettings.num_rows
	if (instanceSettings.profanity_filter !== undefined) newSettings.profanity_filter = instanceSettings.profanity_filter
	if (instanceSettings.speaker_label !== undefined) {
		if (Array.isArray(instanceSettings.speaker_label)) {
			let label = ''
			for (let i = 0; i < instanceSettings.speaker_label.length; i++) {
				label = label === '' ? instanceSettings.speaker_label[i] : label + ', ' + instanceSettings.speaker_label[i]
			}
			newSettings.speaker_label = label
		} else {
			newSettings.speaker_label = instanceSettings.speaker_label
		}
	}
	if (instanceSettings.teletext_page !== undefined)
		newSettings.teletext_page = instanceSettings.teletext_page.toString()
	if (instanceSettings.timeout !== undefined) newSettings.timeout = instanceSettings.timeout
	if (instanceSettings.use_newfor !== undefined) newSettings.use_newfor = instanceSettings.use_newfor
	if (instanceSettings.vision_positioning !== undefined)
		newSettings.vision_positioning = instanceSettings.vision_positioning
	if (Object.keys(newSettings).length === 0) return undefined
	return newSettings
}
