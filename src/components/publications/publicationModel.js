// Normalize older entry points (search, saved links) to the shared reader shape.
export function normalizePublication(post, channels = []) {
  const channel = channels.find(item => item.id === post.channelId || item.name === post.channel);
  const id = post.id || `legacy-${Array.from(`${post.channel}|${post.title}`).reduce((hash, char) => Math.imul(31, hash) + char.charCodeAt(0) | 0, 0).toString(36)}`;
  return {
    ...post, id, type: post.type || 'news', channelId: post.channelId || channel?.id || 'erg-news',
    channelAvatar: post.channelAvatar || post.avatar || channel?.avatar,
    lead: post.lead ?? post.excerpt ?? '',
    likes: Number(String(post.likes || 0).replace(/\s/g, '')) || 0,
    comments: typeof post.comments === 'boolean' ? post.comments : true,
    commentCount: post.commentCount ?? (Number(post.comments) || 0),
    images: post.images || (post.thumb ? [{ id: `${id}-cover`, src: post.thumb, caption: '' }] : []),
    videos: post.videos || [], files: post.files || [],
    description: post.description || { ops: [{ insert: `${post.excerpt || ''}\n` }] },
  };
}

export function mergePublicationState(post, saved, countComments, seed = []) {
  const thread = saved.threads?.[post.id] ?? seed;
  return { ...post, liked: saved.likes?.[post.id] ?? !!post.liked, commentCount: countComments(thread) };
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сент', 'окт', 'ноя', 'дек'];
function publicationTime(post) {
  if (post.publishedAt) return Date.parse(post.publishedAt) || 0;
  // Existing fixtures use localized dates; API records can provide publishedAt.
  const date = /^(\d{1,2})\s+(\p{L}+)(?:\s+(\d{4}))?(?:,\s*(\d{1,2}):(\d{2}))?$/u.exec(post.date || '');
  if (!date) return 0;
  const month = MONTHS.indexOf(date[2]);
  return month < 0 ? 0 : Date.UTC(Number(date[3]) || new Date().getFullYear(), month, Number(date[1]), Number(date[4]) || 0, Number(date[5]) || 0);
}

export function latestPublications(posts, limit = 4) {
  return [...posts].sort((a, b) => publicationTime(b) - publicationTime(a)).slice(0, limit);
}
