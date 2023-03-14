const NodeCache = require('node-cache')
const maskinportenToken = require('@vtfk/maskinporten-auth')
const { certificate, maskinporten, env } = require('../config')
const { logger } = require('@vtfk/logger')

const cache = new NodeCache({ stdTTL: 3600 })

module.exports = async (medHjemmel = true, forceNew = false) => {
  const scope = medHjemmel ? maskinporten.medHjemmelScope : maskinporten.utenHjemmelScope
  const cacheKey = 'maskinportenToken'

  let pfxcert

  if (!forceNew && cache.get(cacheKey)) {
    logger('info', ['getAccessToken', 'found valid token in cache, will use that instead of fetching new'])
    return (cache.get(cacheKey))
  }

  if (env === 'dev') {
    const { readFileSync } = require('fs')
    pfxcert = readFileSync(certificate.pfxPath).toString('base64')
    return pfxcert
  } else {
    // hent fra keyvault (lykke til!)
    pfxcert = certificate.pfxBase64
    console.log(pfxcert)
    logger('info', pfxcert)
    return pfxcert
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
  logger('info', ['getAccessToken', `Got token from Maskinporten, expires in ${token.expires_in} seconds.`])
  cache.set(cacheKey, token, token.expires_in)
  logger('info', ['getAccessToken', 'Token stored in cache'])
  return token
}

/*
module.exports = async (forceNew = false) => {
  const cacheKey = 'graphToken'

  logger('info', ['getAccessToken', 'no token in cache, fetching new from Microsoft'])
  const config = {
    auth: {
      clientId: graphClient.clientId,
      authority: `https://login.microsoftonline.com/${graphClient.tenantId}/`,
      clientSecret: graphClient.clientSecret
    }
  }

  // Create msal application object
  const cca = new ConfidentialClientApplication(config)
  const clientCredentials = {
    scopes: [graphClient.scope]
  }

  const token = await cca.acquireTokenByClientCredential(clientCredentials)
  const expires = Math.floor((token.expiresOn.getTime() - new Date()) / 1000)
  logger('info', ['getAccessToken', `Got token from Microsoft, expires in ${expires} seconds.`])
  cache.set(cacheKey, token.accessToken, expires)
  logger('info', ['getAccessToken', 'Token stored in cache'])

  return token.accessToken
}
*/
