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
