const getAccessToken = require('../lib/getAccessToken')
const axios = require('axios')
const repack = require('../lib/repackFreg')
const decodeAccessToken = require('../lib/decodeAadToken')
const { logConfig, logger } = require('@vtfk/logger')
const { freg } = require('../config')

module.exports = async function (context, req) {
  logConfig({
    prefix: 'azf-freg - Personer',
    azure: {
      context,
      excludeInvocationId: true
    }
  })
  logger('info', ['new Request. Checking token'])
  const decoded = decodeAccessToken(req.headers.authorization)
  if (!decoded.verified) return { status: 401, body: decoded.msg }
  logConfig({
    prefix: `azf-freg - Personer - ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  let accessToken
  try {
    accessToken = await getAccessToken()
  } catch (error) {
    logger('error', ['error when getting access token', error.toString()])
    return { status: 500, body: error.toString() }
  }

  if (!req.body) return { status: 400, body: 'Body is missing' }
  const { ssn, includeRawFreg, includeFortrolig, includeForeldreansvar } = req.body

  if (!ssn) return { status: 400, body: 'Body is missing required property "ssn"' }
  if (ssn.length !== 11) return { status: 400, body: 'Property "ssn" must be lenght 11' }

  const options = {
    includeRawFreg: includeRawFreg || false,
    includeFortrolig: includeFortrolig || false,
    includeForeldreansvar: includeForeldreansvar || false
  }

  const defaultParts = 'part=person-basis&part=relasjon-utvidet'
  const url = `${freg.url}/${freg.rettighet}/api/v1/personer/${ssn}?${defaultParts}`

  try {
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      Accept: 'application/json'
    }
    const config = { headers }
    logger('info', ['calling freg', 'ssn', ssn])
    const { data } = await axios.get(url, config)
    logger('info', ['got data. Trying to repack result'])
    const repacked = repack(data, options)
    logger('info', ['successfully repacked result'])
    return { status: 200, body: repacked }
  } catch (error) {
    logger('error', ['error when calling freg', error.toString()])
    return { status: 500, body: error.toString() }
  }
}
