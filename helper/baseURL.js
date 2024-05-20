module.exports = (req) => {
  const protocol = req.protocol || 'http'
  const host = req.get('host') || 'localhost'
  const baseURL = protocol + '://' + host
  return baseURL;
}