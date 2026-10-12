import { BuildingFactory20Filled, People20Filled, Code20Filled, ShieldCheckmark20Filled, Person20Filled, Calendar20Filled, ClipboardTask20Filled, Lightbulb20Filled } from '@fluentui/react-icons';
import { publicationRubric } from './publicationRubrics';

const icons = { factory: BuildingFactory20Filled, people: People20Filled, digital: Code20Filled, shield: ShieldCheckmark20Filled, person: Person20Filled, calendar: Calendar20Filled, audit: ClipboardTask20Filled, project: Lightbulb20Filled };
export function RubricIcon({ rubric }) {
  const Icon = icons[rubric.icon];
  return <Icon aria-hidden="true" />;
}
export function RubricLabel({ rubric }) { return <><RubricIcon rubric={rubric} /><span>{rubric.label}</span></>; }
export default function PublicationRubric({ post, showRubric = true }) {
  const rubric = showRubric && publicationRubric(post);
  if (!rubric && post.type === 'news') return null;
  return <div className="pw-editorial-labels">
    {rubric && <span className="pw-rubric-badge" aria-label={`Рубрика: ${rubric.label}`}><RubricLabel rubric={rubric} /></span>}
    {post.type === 'audit' && <span className="pw-type-badge"><ClipboardTask20Filled aria-hidden="true" />Обход</span>}
    {post.type === 'project' && <span className="pw-type-badge"><Lightbulb20Filled aria-hidden="true" />Проект-улучшение</span>}
  </div>;
}
