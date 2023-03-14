module.exports = {
  env: process.env.NODE_ENV ?? 'dev',
  certificate: {
    pfxPath: process.env.CERTIFICATE_PFX_PATH ?? 'ukjent sti',
    passphrase: process.env.CERTIFICATE_PASSPHRASE ?? null,
    pfxBase64: process.env.CERTIFICATE_PFX_BASE64 ?? 'ukjent pfxBase64'
  },
  maskinporten: {
    medHjemmelScope: process.env.MASKINPORTEN_MED_HJEMMEL_SCOPE ?? 'et skup',
    utenHjemmelScope: process.env.MASKINPORTEN_UTEN_HJEMMEL_SCOPE ?? 'et skup',
    audience: process.env.MASKINPORTEN_AUDIENCE ?? 'et publikum',
    issuer: process.env.MASKINPORTEN_ISSUER ?? 'utsteder',
    tokenUrl: process.env.MASKINPORTEN_TOKEN_URL ?? 'token.com'
  },
  freg: {
    url: process.env.FREG_URL ?? 'www.vg.vg.vg.no',
    rettighet: process.env.FREG_RETTIGHET ?? 'rettighet'
  }
}
