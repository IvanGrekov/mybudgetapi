export enum ECurrency {
  USD = 'USD',
  EUR = 'EUR',
  UAH = 'UAH',
  BGN = 'BGN',
  CZK = 'CZK',
  DKK = 'DKK',
  HUF = 'HUF',
  NOK = 'NOK',
  PLN = 'PLN',
  RON = 'RON',
  SEK = 'SEK',
}

export enum ELanguage {
  EN = 'EN',
  UA = 'UA',
}

export class User {
  id: string;
  nickname: string;
  defaultCurrency: ECurrency;
  language: ELanguage;
}
