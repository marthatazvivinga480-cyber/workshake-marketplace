export const classNames = (...items: Array<string | false | null | undefined>) =>
  items.filter(Boolean).join(' ')

export const money = (value: number) => `$${value.toFixed(0)}`
