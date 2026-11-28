export const LANGUAGES = Object.freeze([
  {id: 'fr', name: 'Français'},
  {id: 'en', name: 'English'},
  {id: 'zh-Hans', name: '简体中文（预览）'},
  {id: 'de', name: 'Deutsch (Vorschau)'},
].map(Object.freeze));

export function normalizeLanguage(value) {
  return LANGUAGES.some(({id}) => id === value) ? value : 'fr';
}
