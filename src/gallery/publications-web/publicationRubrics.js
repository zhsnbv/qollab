// Four editorial rubrics from the channel's Canva templates (15 Oct 2026).
// Rubrics style the cover; news/audit/project remain independent post types.
export const PUBLICATION_RUBRICS = [
  { value: 'sport', label: 'Спорт', icon: 'sport', accent: '#53b7dc', ink: '#206a8b', tint: '#eaf7fc', title: '#75d1f3', band: 'linear-gradient(105deg, #78cce4 0%, #348bbd 48%, #df8b44 100%)' },
  { value: 'safety', label: 'Безопасность', icon: 'shield', accent: '#f29a52', ink: '#9c5019', tint: '#fff1e6', title: '#ffb375', band: 'linear-gradient(105deg, #b7b3ac 0%, #f8c59a 38%, #e7752a 100%)' },
  { value: 'production', label: 'Про предприятие', icon: 'factory', accent: '#e6b94a', ink: '#60656b', tint: '#f0f1f2', title: '#e2e4e7', band: 'linear-gradient(105deg, #d7d9db 0%, #a9abad 38%, #eebd45 100%)' },
  { value: 'ecology', label: 'Экологические новости', icon: 'leaf', accent: '#84bc51', ink: '#3d7133', tint: '#eef7e7', title: '#b2e78b', band: 'linear-gradient(105deg, #c4e98d 0%, #82bd51 44%, #386a35 100%)' },
];
// Historical labels are not editorial rubrics. Keep the saved content intact,
// but never invent a Canva rubric on behalf of the editor.
export const PUBLICATION_TYPES = {
  audit: { label: 'Обход', icon: 'audit', accent: '#5d9edb', ink: '#225b94', tint: '#e9f3ff', title: '#fff', band: 'linear-gradient(105deg, #a7d5f4 0%, #4b91cb 55%, #24639c 100%)' },
  project: { label: 'Проект-улучшение', icon: 'project', accent: '#60ad87', ink: '#26704d', tint: '#e6f5ed', title: '#fff', band: 'linear-gradient(105deg, #b3ddc4 0%, #58a77d 55%, #2b7753 100%)' },
};
const exampleRubrics = {
  news: 'production', gallery: 'production', text: 'production', video: 'production', file: 'safety',
  'prod-union-award': 'production', 'prod-jig-machine': 'production',
  'prod-fire-drill': 'safety', 'prod-bts-developer': 'production',
};
export function rubricValue(post) {
  const inferred = /sport|спорт/i.test(`${post.channelId || ''} ${post.channel || ''}`) ? 'sport'
    : /eco|эко/i.test(`${post.channelId || ''} ${post.channel || ''}`) ? 'ecology' : 'none';
  const saved = post.rubric ?? exampleRubrics[post.id] ?? inferred;
  return PUBLICATION_RUBRICS.some(rubric => rubric.value === saved) ? saved : 'none';
}
export function publicationRubric(post) { return !PUBLICATION_TYPES[post.type] ? PUBLICATION_RUBRICS.find(rubric => rubric.value === rubricValue(post)) : undefined; }
export function rubricStyle(post) {
  const rubric = PUBLICATION_TYPES[post.type] || publicationRubric(post);
  return rubric ? { '--pw-rubric-accent': rubric.accent, '--pw-rubric-ink': rubric.ink, '--pw-rubric-tint': rubric.tint, '--pw-cover-title': rubric.title, '--pw-rubric-band': rubric.band } : {};
}
