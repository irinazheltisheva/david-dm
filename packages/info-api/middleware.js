export function cors (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')

  if (req.method === 'OPTIONS') {
    res.send()
  } else {
    next()
  }
}
