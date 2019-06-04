export interface getMyInventory {
  success: boolean
  items: Items[]
}
export interface Items {
  item_id: string
  app_id: number
  name: string
  market_name: string
}
export interface Trades {
  success: boolean
  trades: Trade[]
}
export interface Trade {
  costum_id: string
  item_id: string
  price: number
  tradelink: string
}
