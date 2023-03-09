const repackFreg = require('../../lib/repackFreg')

// What to test
const personMedBostedsdresse = require('../data/testpersons/personMedBostedsadresse.json')
const personMedPostdresseOgBostedsadresse = require('../data/testpersons/personMedPostadresseOgBostedsadresse.json')
const personMedAdressebeskyttelse = require('../data/testpersons/personMedAddressebeskyttelse.json')

describe('Adresser blir repacked som forventet når', () => {
  test('Person har bostedadresse, og ikke postadresse', () => {
    const { repacked } = repackFreg(personMedBostedsdresse)
    expect(repacked.bostedsadresse.gateadresse).toBe('Skipavika 88')
    expect(repacked.bostedsadresse.poststed).toBe('NORDSTRØNO')
    expect(repacked.bostedsadresse.postnummer).toBe('5218')
    expect(repacked.bostedsadresse.adressegradering).toBe('ugradert')
    expect(repacked.postadresse.gateadresse).toBe(repacked.bostedsadresse.gateadresse)
    expect(repacked.postadresse.poststed).toBe(repacked.bostedsadresse.poststed)
    expect(repacked.postadresse.postnummer).toBe(repacked.bostedsadresse.postnummer)
  })
  test('Person har postadresse og bostedsadresse med bokstav', () => {
    const { repacked } = repackFreg(personMedPostdresseOgBostedsadresse)
    expect(repacked.bostedsadresse.gateadresse).toBe('Skolegata 30B')
    expect(repacked.bostedsadresse.poststed).toBe('STRØMMEN')
    expect(repacked.bostedsadresse.postnummer).toBe('2010')
    expect(repacked.bostedsadresse.adressegradering).toBe('ugradert')
    expect(repacked.postadresse.gateadresse).toBe('Skravlete Kabin Test 221')
    expect(repacked.postadresse.poststed).toBe('TRANØY')
    expect(repacked.postadresse.postnummer).toBe('8297')
    expect(repacked.postadresse.adressegradering).toBe('ugradert')
  })
  test('Person har adressebeskyttelse strengtFortrolig', () => {
    expect(false).toBe(true)
  })
  test('Person har adressebeskyttelse fortrolig - uten option "includeFortrolig"', () => {
    expect(false).toBe(true)
  })
  test('Person har adressebeskyttelse fortrolig - med option "includeFortrolig"', () => {
    expect(false).toBe(true)
  })
})

describe('Navn, adressebeskyttelse, alder, foedselsdato, foedselsEllerDNummer blir hentet som forventet når', () => {
  test('Person ikke har adressebeskyttelse', () => {
    const { repacked } = repackFreg(personMedBostedsdresse)
    expect(repacked.fulltnavn).toBe('Minkende Dregg')
    expect(repacked.adressebeskyttelse.length).toBe(0)
    expect(repacked.foedselsdato).toBe('1917-07-08')
    expect(repacked.foedselsEllerDNummer).toBe('08871748471')
    expect(!isNaN(repacked.alder)).toBe(true)
  })
  test('Person har addressebeskyttelse og mellomnavn', () => {
    const { repacked } = repackFreg(personMedAdressebeskyttelse)
    console.log(repacked.adressebeskyttelse)
    expect(repacked.adressebeskyttelse[0]).toBe('strengtFortrolig')
    expect(repacked.fulltnavn).toBe('Ordknapp Karosseri Dromedar')
  })
})