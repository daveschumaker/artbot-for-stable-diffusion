export const randomPropertyName = function (obj: any = {}) {
  const keys = Object.keys(obj)
  return keys[Math.floor(Math.random() * keys.length)]
}
