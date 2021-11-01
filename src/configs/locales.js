import id from '../translations/id'

const supported = ['id']
let locale = 'id'

try {
  // get browser default language
  const { 0: browserLang } = navigator.language.split('-')

  if (supported.includes(browserLang)) locale = browserLang
} catch (e) {
  // console.log(e)
}

export default {
  // current locale
  locale,

  // when translation is not available fallback to that locale
  fallbackLocale: 'id',

  // availabled locales for user selection
  availableLocales: [{
    code: 'id',
    flag: 'id',
    label: 'Indonesia',
    messages: id
  }]
}
