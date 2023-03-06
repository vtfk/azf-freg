const maskinportenToken = require('@vtfk/maskinporten-auth')
const { certificate, maskinporten, env } = require('../config')

module.exports = async (medHjemmel = true) => {
  const scope = medHjemmel ? maskinporten.medHjemmelScope : maskinporten.utenHjemmelScope
  let pfxcert
  if (env === 'dev') {
    const { readFileSync } = require('fs')
    pfxcert = readFileSync(certificate.pfxPath).toString('base64')
  } else {
    // hent fra keyvault (lykke til!)
  } 
  const options = {
    url: maskinporten.tokenUrl,
    pfxcert,
    privateKeyPassphrase: certificate.passphrase,
    audience: maskinporten.audience,
    issuer: maskinporten.issuer,
    scope
  }
  const token = await maskinportenToken(options)
  return token
}
