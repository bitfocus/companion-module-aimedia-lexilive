module.exports = {
	async getEngines() {
		if (this.axios === undefined) {
			return undefined
		}
		try {
			const response = await this.axios.get('/live/v1/engines')
			this.logResponse(response)
			if (response.data === undefined) {
				this.log('warn', 'getEngines response contains no data')
				return undefined
			}
			return response.data
		} catch (error) {
			this.logError(error)
			return undefined
		}
	},
    async getInstances() {
		if (this.axios === undefined) {
			return undefined
		}
		try {
			const response = await this.axios.get('/live/v2/instances')
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
                    this.lexi.instanceList.push({id: instance.instance_id, label: instance.settings.name})
                    this.lexi.instanceVariables.push({ variableId: `instance_${instance.instance_id}`, name: `${instance.instance_id} Name` })
                    this.lexi.instanceNames[`instance_${instance.instance_id}`] = instance.settings.name
                }
            })
            this.checkFeedbacks()
			return this.lexi.instanceList
		} catch (error) {
			this.logError(error)
			return undefined
		}
	},

    async updateInstanceList() {
        let instanceList = await this.getInstances()
        if (instanceList) {
            this.updateActions() // export actions
            this.updateFeedbacks() // export feedback
            this.updateVariableDefinitions()
			this.setVariableValues(this.lexi.instanceNames)
			this.updatePresetsDefinitions()
        } else {
            return undefined
        }
    },

    async getInstance(instance_id) {
		if (this.axios === undefined || instance_id === undefined) {
			return undefined
		}
		try {
			const response = await this.axios.get(`/live/v2/instances/${instance_id}`)
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
	},

}
