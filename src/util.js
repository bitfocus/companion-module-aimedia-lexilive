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
				//this.log('debug', JSON.stringify(instance.settings))
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
	const instanceList = await this.getInstances()
	await this.getEngines()
	await this.getBaseModels()
	await this.getCustomModels()
	if (instanceList) {
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedback
		this.updateVariableDefinitions()
		this.setVariableValues(this.lexi.instanceNames)
		this.updatePresetsDefinitions()
	} else {
		return undefined
	}
}

export async function getInstance(instance_id) {
	if (this.axios === undefined || instance_id === undefined) {
		return undefined
	}
	try {
		const response = await this.queue.add(async () => {
			return await this.axios.get(`/live/v2/instances/${instance_id}`)
		})
		this.logResponse(response)
		if (response.data === undefined) {
			this.log('warn', `getInstance/${instance_id} response contains no data`)
			return undefined
		}
		this.lexi.instanceState[response.data.instance.instance_id] = response.data.instance.state
		this.checkFeedbacks()
		return response.data
	} catch (error) {
		this.logError(error)
		return undefined
	}
}
