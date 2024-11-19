import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import UpgradeScripts from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'
import UpdatePresetsDefinitions from './presets.js'
import * as config from './config.js'
import * as util from './util.js'
import axios from 'axios'
import os from 'os'
import module_info from '../package.json' assert { type: 'json' }

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
		this.origin_field = `companion_v${module_info.version}@${userinfo.username}:${hostname}`
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
			try {
				this.log(
					'error',
					`${error.response.status}: ${JSON.stringify(error.code)}\n${JSON.stringify(error.response.data)}`
				)
				if (error.response.data.error === 'Authentication Failed') {
					this.updateStatus(InstanceStatus.AuthenticationFailure, `${error.response.status}: ${JSON.stringify(error.code)}`)
					if (this.pollTimer) {
						clearTimeout(this.pollTimer)
						delete this.pollTimer
					}
				} else {
					this.updateStatus(InstanceStatus.ConnectionFailure, `${error.response.status}: ${JSON.stringify(error.code)}`)
				}
			} catch {
				this.log('error', `${JSON.stringify(error.code)}\n${JSON.stringify(error)}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, `${JSON.stringify(error.code)}`)
			}
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
					username: this.config.user,
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
		await this.configUpdated(config)
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
		if (this.lexi) {
			delete this.lexi
		}
	}

	async configUpdated(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.initLexi()
		this.config = config
		if (this.config.pass !== dummy_password && this.config.pass !== '') {
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

	updatePresetsDefinitions() {
		UpdatePresetsDefinitions(this)
	}
}

runEntrypoint(LexiLive, UpgradeScripts)
