const getAccessToken = require('../lib/getAccessToken')
const axios = require('axios')
const repack = require('../lib/repackFreg')

module.exports = async function (context, req) {
  /*
  Sjekke at det er med bearer-token
  Hente ut APP id evt upn fra token

  Validere input fra bruker
  Validere rolle
  Hente og returnere data fra FREG
  Repack: legg til standardfelter for oss selv for å gjøre ting lettere i fremtiden :-)

  */
  let accessToken
  try {
    accessToken = await getAccessToken()
  } catch (error) {
    console.log(error.response)
    return { status: 500, body: error.toString() }
  }
  // return { status: 200, body: accessToken }
  const { ssn, includeFortrolig, includeForeldreansvar } = req.body
  if (!ssn) return { status: 400, body: 'Body is missing required property "ssn"' }
  if (ssn.length !== 11) return { status: 400, body: 'Property "ssn" must be lenght 11' }

  const options = {
    includeFortrolig: includeFortrolig || false,
    includeForeldreansvar: includeForeldreansvar || false
  }

  // const url = `${freg.url}/${freg.rettighetUrl}/v1/personer/${ssn}`
  // const url = `${freg.url}/${freg.rettighetUrl}` // /v1/personer/${ssn}`
  const url = `https://folkeregisteret-api-konsument.sits.no/folkeregisteret/offentlig-med-hjemmel/api/v1/personer/${ssn}`
  // return { status: 200, body: url}
  try {
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      Accept: 'application/json'
    }
    const config = { headers }
    const { data } = await axios.get(url, config)
    const repacked = repack(data, options)
    return { status: 200, body: repacked }
  } catch (error) {
    console.log(error.response)
    return { status: 500, body: error.toString() }
  }

  // Kjør en spørring mot freg

  // Repack resultatet til noe kult

  // Returner til klient  v1/personer/{personidentifikator}"
}
