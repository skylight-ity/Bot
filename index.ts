#!/usr/bin/env node
import { createLogger } from 'bunyan';
import { Waxpeer } from 'waxpeer';
import { Bot } from './SteamBot/Bot';
import { Config } from './SteamBot/interfaces';
import { sleep } from './SteamBot/utils';

require('dotenv').config()
const config: Config = {
  account_name: process.env.STEAMBOT_TRADE_BOT_ACCOUNT_NAME,
  account_password: process.env.STEAMBOT_TRADE_BOT_ACCOUNT_PASSWORD,
  identity_secret: process.env.STEAMBOT_TRADE_BOT_IDENTITY_SECRET,
  shared_secret: process.env.STEAMBOT_TRADE_BOT_SHARED_SECRET,
  app_id: parseInt(process.env.STEAMBOT_TRADE_BOT_APP_ID, 10),
  context_id: parseInt(process.env.STEAMBOT_TRADE_BOT_CONTEXT_ID, 10),
}
export const logger = createLogger({ name: 'trade-bot', account_name: config.account_name })
const log = logger.child({ source: 'main' })
const wlog = logger.child({ source: 'wax-peer' })
async function main() {
  log.info('Starting')
  const bot = new Bot(config, logger)
  await bot.start()

  bot.getMyApi().then(key => startWaxpeer(key, bot)).catch(e => {
    log.error(`Error happen when trying to fetch your steam api`)
  })
}
async function startWaxpeer(key: string, bot: Bot) {
  console.log(key)
  let peer = new Waxpeer(process.env.WAXPEER_API, key)
  log.info('Started waxpeer')
  try {
    let steamSetter = await peer.setMyKeys()
  } catch (e) {
    console.error(e)
  }

  log.info('Passed waxpeer api check')
  while (true) {
    if (!bot.sessionHasExpired) {
      try {
        let { success, trades } = await peer.getTradesToSend()
        if (success && trades.length > 0) {
          for (let trade of trades) {
            await bot.sendTrade({ id: trade.id, trade_message: trade.trade_message, tradelink: trade.tradelink, items: trade.items.map(i => i.item_id) })
          }
        }
      } catch (e) {
        console.log(e)
        wlog.error(`Maybe waxpeer server is down, retrying in a few seconds`)
      }
    }
    await sleep(1000)
  }
}
main().catch(console.error)
