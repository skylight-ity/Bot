import { EventEmitter } from 'events'
import RequestPromise from 'request-promise'
import { logger } from '..'
import { getMyInventory, Trades } from '../types'
export class WaxPeer extends EventEmitter {
  private api: string
  public baseUrl: string =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3020/' : 'https://api.waxpeer.com/'
  public verson: string = 'v1'
  public trades: { [key: string]: number } = {}
  private log
  constructor(api: string, l) {
    super()
    this.log = l
    this.api = api
    this.start()
  }
  async listen() {
    this.log.info('Started listening')
    while (true) {
      try {
        await this.proccessTrades()
      } catch (e) {
        logger.error(`WAX PEER error, retrying in 5 seconds`)
      }
      await this.sleep(5000)
    }
  }
  async sleep(time: number) {
    return new Promise(res => setTimeout(res, time))
  }
  async ping(): Promise<{ success: boolean; msg: string }> {
    return await this.get('ping')
  }
  async proccessTrades() {
    logger.info(`Fetching trades`)
    let request_trades: Trades = await this.get('ready-to-transfer-p2p')
    if (this.request && request_trades.success) {
      for (let trade of request_trades.trades) {
        if (!this.trades[trade.costum_id]) {
          this.trades[trade.costum_id] = 1
          this.emit('new-trade', trade)
        } else if (this.trades[trade.costum_id] < 4) {
          this.trades[trade.costum_id] += 1
          this.emit('new-trade', trade)
        }
      }
    }
  }

  async setMyApi(api: string) {
    return new Promise(async (resolve, reject) => {
      let { success, msg = null } = await this.get('set-my-steamapi', `steam_api=${api}`)
      if (success) return resolve()
      else this.log.error(msg)
      return reject()
    })
  }

  async start() {
    this.log.info('Started WAX PEER')
    let { success, msg } = await this.ping()
    if (msg === 'noSteamApi') {
      this.emit('noSteamApi')
    }
    if (success) {
      this.log.info('Online')
      await this.fetchMyInventory()
      this.log.info('Inventory fetched')
      let items = await this.getInventory()
      if (items.length > 0) {
        let ids = items.map(i => i.item_id)
        await this.transferToInventory(ids)
      }
      this.log.info('Fetched inventory')
      await this.listen()
    } else {
      this.log.error(msg)
    }
  }

  public async transferToInventory(ids: string[]) {
    let copy = [...ids]
    return new Promise(async resolve => {
      while (copy.length > 0) {
        let newIds = copy.splice(0, 50)
        let itemsQuery = newIds.map(i => `id=${i}`).join('&')

        await this.get('list-items-steam', itemsQuery)
      }
      this.emit('loaded_inventory')
      return resolve()
    })
  }

  public async fetchMyInventory() {
    return await this.get('fetch-my-inventory')
  }

  public async getInventory() {
    let request: getMyInventory = await this.get('get-my-inventory')
    if (request.success) return request.items
    else return []
  }

  public async get<T = object>(url: string, token?: string) {
    let { baseUrl, api, verson } = this
    let newUrl = `${baseUrl}${verson}/${url}?api=${api}`
    if (token) newUrl += `&${token}`
    try {
      return await this.request<T>(newUrl)
    } catch (e) {
      this.log.error(newUrl, e)
      return null
    }
  }

  public async request<T = object>(url: string, opt?: RequestPromise.RequestPromiseOptions) {
    try {
      return <T>JSON.parse(await RequestPromise(url, opt))
    } catch (e) {
      this.log.error(`Looks like something wrong with waxpeer retrying in 5 seconds`)
      await this.sleep(5000)
      return await this.request(url, opt)
    }
  }
}
