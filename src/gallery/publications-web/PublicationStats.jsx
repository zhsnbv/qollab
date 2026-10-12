import { useState } from 'react';
import { Modal } from 'antd';
import { Eye20Regular } from '@fluentui/react-icons';
import { titleOf } from './data';

export default function PublicationStats({ post }) {
  const [open, setOpen] = useState(false);
  const hasViews = !!post.views && post.views !== '0';
  // Review-only examples, never sent to or read from production analytics.
  const metrics = [
    [post.views || '0', 'Показы в ленте'],
    [hasViews ? '215' : '0', 'Открытия статьи'],
    [(post.likes || 0) + (post.liked ? 1 : 0), 'Реакции'],
    [post.commentCount || 0, 'Комментарии'],
  ];
  return <>
    <button type="button" className="pw-views" aria-label={`Статистика публикации: ${post.views || '0'} показов`} aria-haspopup="dialog" onClick={() => setOpen(true)}><Eye20Regular /><span>{post.views || '0'}</span></button>
    <Modal className="pw-statistics-modal" title="Статистика публикации" open={open} onCancel={() => setOpen(false)} footer={null} width={520} centered destroyOnHidden>
      <p className="pw-statistics-title" title={titleOf(post)}>{titleOf(post)}</p>
      <dl className="pw-statistics-grid">{metrics.map(([value, label], i) => <div key={label} className={i === 0 ? 'is-primary' : ''}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="pw-statistics-hint">Показы — появления карточки в ленте. Открытия — переходы в статью.</p>
      <p className="pw-statistics-period">За всё время</p>
    </Modal>
  </>;
}
