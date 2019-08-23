import SteamUser = require('steam-user')
import SteamCommunity = require('steamcommunity')
import SteamTOTP = require('steam-totp')
import TradeOfferManager = require('steam-tradeoffer-manager')
import { resolve as resolvePath } from 'path'
import { logger } from '..'
import { Trade } from '../types'
import { Config, TradeOffer, TradeOfferState } from './interfaces'
import { existsAsync, readFileAsync, waitAsync, writeFileAsync } from './utils'

export class Bot {
  protected _user: SteamUser
  protected _community: SteamCommunity
  protected _manager: TradeOfferManager
  protected _sessionHasExpired: boolean = false
  protected _log
  constructor(protected _config: Config, private l) {
    const log = l.child({ source: 'bot' })
    this._log = log
    log.info('Starting BOT')
    this._user = new SteamUser({
      promptSteamGuardCode: false,
    })

    this._community = new SteamCommunity()

    this._manager = new TradeOfferManager({
      steam: this._user,
      community: this._community,
      language: 'en',
    })

    this._user.on('loggedOn', () => {
      log.info('SteamUser logged on')
      this._user.setPersona(1)
    })

    this._user.on('webSession', (sessionId, cookies) => {
      log.info(`SteamUser session ${sessionId} started, configuring TradeManager and SteamCommunity cookies`)

      this._sessionHasExpired = false
      this._manager.setCookies(cookies)
      this._community.setCookies(cookies)
      this._community.startConfirmationChecker(1000, this._config.identity_secret)
    })

    this._user.on('disconnected', (eresult, msg) => {
      log.warn('SteamUser disconnected', { eresult, msg })
    })

    this._user.on('error', error => {
      log.error('SteamUser error', { error })
    })

    this._user.on('steamGuard', async (domain, callback) => {
      log.warn('SteamUser requires Steam Guard code, will present new code in 30 seconds...')
      await waitAsync(30)

      callback(SteamTOTP.getAuthCode(this._config.shared_secret))
    })

    this._community.on('error', error => {
      log.error('SteamCommunity error', { error })
    })

    this._community.on('sessionExpired', error => {
      log.debug(`this._community.on('sessionExpired')`, { error })

      if (this._sessionHasExpired) {
        return
      }

      this._sessionHasExpired = true
      log.warn('SteamCommunity session has expired, logging SteamUser on again')
      this._user.webLogOn()
    })

    this._manager.on('pollData', async pollData => {
      log.info('TradeManager writing pollData')

      const pollDataFilename = resolvePath(__dirname, `pollData-${this._config.account_name}.json`)
      await writeFileAsync(pollDataFilename, JSON.stringify(pollData))

      log.info('TradeManager wrote pollData')
    })
    this._community.on('newConfirmation', function(d) {
      var time = Math.round(Date.now() / 1e3)
      var data = SteamTOTP.getConfirmationKey(this._config.identity_secret, time, 'allow')
      this._community.respondToConfirmation(d.id, d.key, time, data, true, function(error) {
        console.log('[BOT] Outgoing confirmation for the trade: ' + d.key)
        if (error) {
          console.log('[BOT] Error while confirming the trade: ' + error)
          this._user.webLogOn()
        }
      })
    })
    this._manager.on('error', error => {
      log.info('TradeManager error', { error })
    })

    this._manager.on('sentOfferChanged', async (offer: TradeOffer, oldState: TradeOfferState) => {
      log.info('TradeManager sent offer changed', { offer, oldState })

      console.log(offer, oldState)
    })
  }
  async start() {
    const log = this._log

    const pollDataFilename = resolvePath(__dirname, `pollData-${this._config.account_name}.json`)
    log.info(`Checking for polling data file ${pollDataFilename}`)

    if (await existsAsync(pollDataFilename)) {
      log.info(`Found polling data file ${pollDataFilename}, restoring TradeOfferManager state`)

      const pollData = await readFileAsync(pollDataFilename)
      this._manager.pollData = JSON.parse(pollData.toString())
    }

    log.info(`Attempting login as '${this._config.account_name}'`)

    this._user.logOn({
      accountName: this._config.account_name,
      password: this._config.account_password,
      twoFactorCode: SteamTOTP.getAuthCode(this._config.shared_secret),
    })

    await this._waitForSteamConnection()
    await this._startListening()
  }

  public sendTrade({ item_id, tradelink, costum_id }: Trade) {
    logger.info(`Sending a new TRADE to ${tradelink} an item id ${item_id}`)
    const offer = this._manager.createOffer(tradelink)
    offer.addMyItem({
      appid: 730,
      contextid: 2,
      amount: 1,
      assetid: item_id,
    })
    offer.setMessage(costum_id)
    offer.send((err, send) => {
      if (err) return logger.error(err)
      logger.info(`Sent the trade`, send)
      this._community.acceptConfirmationForObject(this._config.identity_secret, offer.id, errConfirm => {
        if (errConfirm) return logger.error(`Error confirming the trade`)
        logger.info(`Confirmed the trade ${offer.id}`)
      })
    })
  }
  public getMyApi() {
    return new Promise((resolve, reject) => {
      this._community.getWebApiKey('localhost', (err, key) => {
        if (!err && key) {
          this._log.info('Generated a new KEY')
          return resolve(key)
        } else {
          this._log.error(err)
          return reject()
        }
      })
    })
  }
  protected async _waitForSteamConnection() {
    while (true) {
      if (this._user.steamID) {
        this._log.info('SteamUser is now connected')
        return
      }

      this._log.info('Waiting for SteamUser to be connected')
      await waitAsync(5)
    }
  }

  protected async _startListening() {
    this._log.info('Establishing listener connections')
  }
}
