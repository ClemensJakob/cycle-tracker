export default {
  locales: ['de', 'en'],
  output: 'src/locales/$LOCALE.json',
  input: ['src/**/*.{ts,tsx}'],
  keySeparator: false,
  namespaceSeparator: false,
  defaultValue: (locale, namespace, key) => (locale === 'de' ? key : ''),
  sort: true,
}
