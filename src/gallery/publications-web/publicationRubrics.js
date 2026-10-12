// Proposed editorial taxonomy based on topics in the live Qollab feed, 12 Oct 2026.
// Rubrics describe the topic; news/audit/project continue to define the post structure.
export const PUBLICATION_RUBRICS = [
  { value: 'production', label: 'Производство', icon: 'factory', accent: '#d99735', ink: '#8b5311', tint: '#fff3df', shade: '32 23 12' },
  { value: 'people', label: 'Люди ERG', icon: 'people', accent: '#b48bcc', ink: '#75468f', tint: '#f5edfa', shade: '31 17 41' },
  { value: 'digital', label: 'Технологии', icon: 'digital', accent: '#75b2e8', ink: '#246296', tint: '#eaf4fd', shade: '9 28 48' },
  { value: 'safety', label: 'Безопасность', icon: 'shield', accent: '#efc45c', ink: '#886313', tint: '#fff7df', shade: '36 28 10' },
  { value: 'appointments', label: 'Назначения', icon: 'person', accent: '#93accf', ink: '#445f88', tint: '#eef2f9', shade: '19 30 48' },
  { value: 'events', label: 'События', icon: 'calendar', accent: '#e5a091', ink: '#a34e3b', tint: '#fff0eb', shade: '45 20 23' },
];

const exampleRubrics = {
  news: 'production', gallery: 'production', text: 'digital', video: 'digital', file: 'safety',
  'prod-union-award': 'events', 'prod-jig-machine': 'production',
  'prod-fire-drill': 'safety', 'prod-bts-developer': 'people',
};
export function rubricValue(post) {
  const value = post.rubric ?? exampleRubrics[post.id] ?? 'none';
  return PUBLICATION_RUBRICS.some(rubric => rubric.value === value) ? value : 'none';
}
export function publicationRubric(post) { return PUBLICATION_RUBRICS.find(rubric => rubric.value === rubricValue(post)); }
export function rubricStyle(post) {
  const rubric = publicationRubric(post);
  return rubric ? { '--pw-rubric-accent': rubric.accent, '--pw-rubric-ink': rubric.ink, '--pw-rubric-tint': rubric.tint, '--pw-cover-shade': rubric.shade } : {};
}
