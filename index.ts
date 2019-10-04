#!/usr/bin/env node
import { createLogger } from 'bunyan'
import { Waxpeer } from 'waxpeer'
import { Bot } from './SteamBot/Bot'
import { Config } from './SteamBot/interfaces'
import { Trade } from './types'
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
  let peer = new Waxpeer(process.env.WAXPEER_API)
  peer.on('new-trade', (trade: Trade) => bot.sendTrade(trade))
  peer.on('noSteamApi', () => {
    log.error('Wrong steam api')
    bot
      .getMyApi()
      .then((key: string) => {
      })
      .catch(log.error)
  })
}

main().catch(console.error)
