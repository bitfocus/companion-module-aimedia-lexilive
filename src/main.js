const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const config = require('./config.js')
const util = require('./util')
const axios = require('axios')
const os = require('os')

const hostname = os.hostname()
const userinfo = os.userInfo()

const api_endpoint = 'https://eegcloud.tv/speech-recognition'
const api_timeOut = 5000
const api_headers = { 'Content-Type': 'application/json' }

const dummy_password = '******'

const pollInterval = 2000

class LexiLive extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, { ...config, ...util })
		this.pollTimer = {}
		this.origin_field = `companion@${userinfo.username}:${hostname}`
		console.log(this.origin_field)
	}

	logResponse(response) {
		if (this.config.verbose) {
			console.log(response)
		}
		if (response.data !== undefined) {
			this.updateStatus(InstanceStatus.Ok)
			this.log('debug', `Data Recieved: ${JSON.stringify(response.data)}`)
		} else {
			this.updateStatus(InstanceStatus.UnknownWarning, 'No Data')
			this.log('warn', `Response contains no data`)
		}
	}

	logError(error) {
		if (this.config.verbose) {
			console.log(error)
		}
		if (error.code !== undefined) {
			this.log('error', `Error: ${JSON.stringify(error.code)}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, JSON.stringify(error.code))
		} else {
			this.log('error', `No error code`)
			this.updateStatus(InstanceStatus.UnknownError)
		}
	}

	pollStatus() {
		this.getInstances()
		this.pollTimer = setTimeout(() => {
			this.pollStatus()
		}, pollInterval)
	}

	async setupAxios() {
		if (this.pollTimer) {
			clearTimeout(this.pollTimer)
		}
		if (this.axios) {
			delete this.axios
		}
		if (this.config.user && this.config.password) {
			this.axios = axios.create({
				baseURL: api_endpoint,
				timeout: api_timeOut,
				headers: api_headers,
				auth: {
					username: this.config.username,
					password: this.config.password,
				},
		})
		this.getEngines()
		this.updateInstanceList()
		this.pollStatus()
		} else {
			this.log('warn', `Username / Password undefined`)
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	initLexi() {
		if (this.lexi) {
			delete this.lexi
		}
		this.lexi = {
			instanceList: [],
			instanceState: [],
			instanceVariables: [],
			instanceNames: [],
		}
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.initLexi()
		this.config = config
		if (this.config.pass !== dummy_password) {
			this.config.password = await this.parseVariablesInString(this.config.pass)
			this.config.pass = dummy_password
			this.saveConfig(this.config)
		}
		this.setupAxios()
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		if (this.pollTimer) {
			clearTimeout(this.pollTimer)
			delete this.pollTimer
		}
		if (this.axios) {
			delete this.axios
		}
	}

	async configUpdated(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.initLexi()
		this.config = config
		if (this.config.pass !== dummy_password) {
			this.config.password = await this.parseVariablesInString(this.config.pass)
			this.config.pass = dummy_password
			this.saveConfig(this.config)
		}
		this.setupAxios()
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(LexiLive, UpgradeScripts)
