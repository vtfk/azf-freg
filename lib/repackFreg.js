const capitalize = require('capitalize')

const capitalizeWords = data => {
  const options = { skipWord: /^(i|og|von|av|fra|de)$/ }
  return capitalize.words(data, options)
}

const defaultPostAdresse = {
  adressegradering: 'ugradert',
  gateadresse: 'Ukjent adresse',
  postnummer: '9999',
  poststed: 'UKJENT',
  landkode: 'NO'
}

const getAddress = (address, options= {}) => {
  const { includeFortrolig } = options 
  if (!address) { return null }
  const usefulAddress = {
    ...defaultPostAdresse,
    adressegradering: address.adressegradering
  }
  if (usefulAddress.adressegradering.toLowerCase() === 'fortrolig' && !includeFortrolig) {
    usefulAddress.gateadresse = "Fortrolig adresse"
    return usefulAddress
  }
  if (usefulAddress.adressegradering.toLowerCase() === 'strengtfortrolig' && !includeFortrolig) {
    usefulAddress.gateadresse = "Strengt fortrolig adresse"
    return usefulAddress
  }
  if (address.vegadresse) {
    usefulAddress.gateadresse = `${address.vegadresse.adressenavn} ${address.vegadresse.adressenummer.husnummer}${address.vegadresse.adressenummer.husbokstav ?? ''}`
    usefulAddress.postnummer = address.vegadresse.poststed.postnummer || defaultPostAdresse.postnummer
    usefulAddress.poststed = address.vegadresse.poststed.poststedsnavn || defaultPostAdresse.poststed
  } else if (address.matrikkeladresse) {
    usefulAddress.gateadresse = `${address.matrikkeladresse.coAdressenavn ? address.matrikkeladresse.coAdressenavn + ' ' : ''}${address.matrikkeladresse.adressetilleggsnavn ?? defaultPostAdresse.gateadresse}`
    usefulAddress.postnummer = address.matrikkeladresse.poststed.postnummer || defaultPostAdresse.postnummer
    usefulAddress.poststed = address.matrikkeladresse.poststed.poststedsnavn || defaultPostAdresse.poststed
  } else if (address.ukjentBosted) {
    // ikke gjør noe (bruk default)

  } else if (address.postboksadresse) { 
    usefulAddress.gateadresse = `${address.postboksadresse.postbokseier ? address.postboksadresse.postbokseier + ' ' : ''}${address.postboksadresse.postboks}`
    usefulAddress.postnummer = address.postboksadresse.poststed.postnummer || defaultPostAdresse.postnummer
    usefulAddress.poststed = address.postboksadresse.poststed.poststedsnavn || defaultPostAdresse.poststed
  } else if (address.utenlandskAdresse) {
    let megaadresse = ''
    if (address.utenlandskAdresse.coAdressenavn) megaadresse += address.utenlandskAdresse.coAdressenavn + ' '
    if (address.utenlandskAdresse.postboks) megaadresse += address.utenlandskAdresse.postboks + ' '
    if (address.utenlandskAdresse.adressenavn) megaadresse += address.utenlandskAdresse.adressenavn + ' '
    if (address.utenlandskAdresse.bygning) megaadresse += address.utenlandskAdresse.bygning + ' '
    if (address.utenlandskAdresse.boenhet) megaadresse += address.utenlandskAdresse.boenhet + ' '
    if (address.utenlandskAdresse.etasjenummer) megaadresse += address.utenlandskAdresse.etasjenummer + ' '
    let megapoststed = ''
    if (address.utenlandskAdresse.byEllerStedsnavn) megapoststed += address.utenlandskAdresse.byEllerStedsnavn + ' '
    if (address.utenlandskAdresse.region) megapoststed += address.utenlandskAdresse.region + ' '
    if (address.utenlandskAdresse.distriktsnavn) megapoststed += address.utenlandskAdresse.distriktsnavn + ' '
    usefulAddress.gateadresse = megaadresse.trim() || 'Unknown address'
    usefulAddress.postnummer = address.utenlandskAdresse.postkode || 'Unknown post code'
    usefulAddress.poststed = megapoststed.trim() || 'UNKNOWN'
    usefulAddress.landkode = address.utenlandskAdresse.landkode
  } else if (address.utenlandskAdresseIFrittFormat) {
    let megaadresse = ''
    if (address.utenlandskAdresseIFrittFormat.adresselinje) megaadresse = address.utenlandskAdresseIFrittFormat.adresselinje.join(' ')
    usefulAddress.gateadresse = megaadresse.trim() || 'Unknown address'
    usefulAddress.postnummer = address.utenlandskAdresseIFrittFormat.postkode || 'Unknown post code'
    usefulAddress.poststed = address.utenlandskAdresseIFrittFormat.byEllerStedsnavn || 'UNKNOWN'
    usefulAddress.landkode = address.utenlandskAdresseIFrittFormat.landkode
  } else {
    throw new Error('This is not an address!')
  }
  return usefulAddress
}

module.exports = (fregRes, options = {}) => {
  // gå gjennom freg objktet -> pakk ut standard-attributtene vi ønsker å bruke
  //feltet adressebeskyttelse er knyttet mot personen, adresseelemeneter har i tillegg et eget adressegraderingsfelt
  const { includeFortrolig, includeForeldreansvar } = options
  const navn = fregRes.navn.find(ele => ele.erGjeldende)
  const fornavn = navn.mellomnavn ? capitalizeWords(navn.fornavn) + ' ' + capitalizeWords(navn.mellomnavn) : capitalizeWords(navn.fornavn)
  const etternavn = capitalizeWords(navn.etternavn)
  const fulltnavn = fornavn + ' ' + etternavn

  const foedselsEllerDNummer = (fregRes.identifikasjonsnummer.find(ele => ele.erGjeldende))?.foedselsEllerDNummer
  if (!foedselsEllerDNummer) throw new Error('Person does not have a valid id-number (ssn)')

  const foedselsdato = (fregRes.foedsel.find(ele => ele.erGjeldende))?.foedselsdato
  const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
  const alder = getAge(foedselsdato)
  console.log(alder)

  const adressebeskyttelse = fregRes.adressebeskyttelse?.filter(ele => ele.erGjeldende).map(ele => ele.graderingsnivaa) ?? []
  const bostedsadresse = getAddress(fregRes.bostedsadresse?.find(ele => ele.erGjeldende) ?? null, options)
  const deltbostedsadresse = getAddress(fregRes.deltBosted?.find(ele => ele.erGjeldende) ?? null, options)
  const oppholdsadresse = getAddress(fregRes.oppholdsadresse?.find(ele => ele.erGjeldende) ?? null, options)
  let postadresse = getAddress(fregRes.postadresse?.find(ele => ele.erGjeldende) ?? null, options)
  const postadresseIUtlandet = getAddress(fregRes.postadresseIUtlandet?.find(ele => ele.erGjeldende) ?? null, options)
  const foreldreansvar = fregRes.foreldreansvar?.filter(ele => ele.erGjeldende) ?? []

  // En person kan ha: bostedsadresse, oppholdsadresse, postadresse og postadresse i utlandet
  // send videre postadresse, bostedsadresse og postadresse i utlandet
  if (!postadresse) postadresse = bostedsadresse
  if (!postadresse) postadresse = deltbostedsadresse
  if (!postadresse) postadresse = oppholdsadresse
  if (!postadresse) postadresse = postadresseIUtlandet
  if (!postadresse) postadresse = defaultPostAdresse

  
  const repacked = {
    foedselsEllerDNummer,
    fornavn,
    etternavn,
    fulltnavn,
    foedselsdato,
    alder,
    adressebeskyttelse,
    bostedsadresse: bostedsadresse,
    deltbostedsadresse: deltbostedsadresse,
    oppholdsadresse: oppholdsadresse,
    postadresse: postadresse,
    postadresseIUtlandet: postadresseIUtlandet
  }
  if (includeForeldreansvar) repacked.foreldreansvar = foreldreansvar



  // bostedsadresse, postadresse (evt bosted om det ikke finnes), fornavn, etternavn og fullt navn, fødselsnummer, fødselsdato, alder, foreldre, verge, foreldreansvar
  // adressesperre,  
  // pakke disse inn i et nytt objekt
  return { freg:fregRes, repacked }
}