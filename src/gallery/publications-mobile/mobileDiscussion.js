// Discussion state is shared by the feed, reader and sheet, independently of mounting.
export function commentCount(items = []) {
  return items.reduce((sum, item) => sum + 1 + commentCount(item.replies), 0);
}

export function appendComment(items, parentId, comment) {
  if (!parentId) return [...items, comment];
  return items.map(item => item.id === parentId
    ? { ...item, replies: [...(item.replies || []), comment] }
    : { ...item, replies: appendComment(item.replies || [], parentId, comment) });
}

export function toggleCommentLike(items, id) {
  return items.map(item => item.id === id
    ? { ...item, liked: !item.liked }
    : { ...item, replies: toggleCommentLike(item.replies || [], id) });
}

export function sortComments(items, sort) {
  return [...items].sort((a, b) => sort === 'new'
    ? (b.createdAt || 0) - (a.createdAt || 0)
    : ((b.likes || 0) + Number(!!b.liked)) - ((a.likes || 0) + Number(!!a.liked)));
}
