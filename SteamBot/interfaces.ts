export interface Config {
  account_name: string
  account_password: string
  identity_secret: string
  shared_secret: string
  app_id: number
  context_id: number
}

export interface User {
  steam_id: string
  trade_link_url?: string
  balance: number
}

export interface Trade {
  id: number
  created_at: Date
  user_steam_id: string
  _item_names: string[]
  merchant_steam_id?: string
  offered_at?: Date
  completed_at?: Date
  _total: number
}

export interface TradeDeposit extends Trade {
  _bonus: number
}

export interface TradeDepositItem {
  trade_deposit_id: number
  steam_asset_id: string
}

export interface TradeWithdrawalItem {
  trade_withdrawal_id: number
  steam_asset_id: string
}

export interface UserDetails {
  personaName: string
  contexts: Array<{}>
  escrowDays: number
  avatarIcon: string
  avatarMedium: string
  avatarFull: string
}

export interface TradeOfferManager {
  pollData: {}

  setCookies(cookies: any)
  on(event: string, callback: (...data: any[]) => void)
  createOffer(tradeUrl: string): TradeOffer

  getUserInventoryContents(
    steamId: string,
    appId: number,
    contextId: number,
    tradableOnly: boolean,
    callback: (err: null | Error, inventory: any[], currencies: any[]) => void,
  )
}

export interface TradeOffer {
  id: string
  message: string
  send(cb: (error: Error, status: string) => void): void
  accept(cb: (error: Error, status: string) => void): void
  decline(cb: (error: Error) => void): void
  created: Date
  addTheirItems(items: string[])
  addMyItems(items: string[])
  setMessage(message: string)
  getUserDetails(cb: (err: Error | undefined, us: UserDetails, them: UserDetails & { probation: boolean }) => void)
  state: TradeOfferState
  itemsToReceive: Array<{}>
  itemsToGive: Array<{}>
}

export interface UserDetailsObject {
  us: UserDetails
  them: UserDetails & {
    probation: boolean
  }
}

export const enum TradeOfferState {
  Invalid = 1,
  Active,
  Accepted,
  Countered,
  Expired,
  Cancelled,
  Declined,
  InvalidItems,
  CreatedNeedsConfirmation,
  CanceledBySecondFactor,
  InEscrow,
}

export const COMPLETABLE_STATES = [TradeOfferState.Active, TradeOfferState.CreatedNeedsConfirmation]

export interface OfferData {
  bot_id: number
  tradeoffer_id: string
  tradeoffer_error: string
  items: number[]
}
