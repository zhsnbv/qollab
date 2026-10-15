import { PUBLICATION_TYPES, publicationRubric } from './publicationRubrics';
import { RubricIcon } from './PublicationRubric';

export default function PublicationIdentity({ post, onChannel }) {
  const rubric = PUBLICATION_TYPES[post.type] || publicationRubric(post);
  const content = <>
    <span className="pw-identity-avatar">
      <img className="pw-channel-avatar" src={post.channelAvatar || '/img/posts/ch-erg-news.png'} alt="" width={44} height={44} />
      {rubric && <span className="pw-identity-rubric-icon" aria-hidden="true"><RubricIcon rubric={rubric} /></span>}
    </span>
    <span className="pw-identity-text">
      <strong className="pw-identity-name">{post.channel || 'ERG News'}</strong>
      <span className="pw-identity-meta">{rubric && <><span className="pw-identity-rubric">{rubric.label}</span><span aria-hidden="true">·</span></>}<time>{post.date || 'Только что'}</time></span>
    </span>
  </>;
  return onChannel ? <button type="button" className="pw-publication-identity" aria-label={`Открыть канал ${post.channel || 'ERG News'}`} onClick={onChannel}>{content}</button> : <div className="pw-publication-identity">{content}</div>;
}
