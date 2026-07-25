const K_RECORD = 'dolar-crm:juego1-record'

export function getRecord(): number {
  return Number(localStorage.getItem(K_RECORD) ?? 0)
}

export function saveRecord(score: number) {
  if (score > getRecord()) localStorage.setItem(K_RECORD, String(score))
}
