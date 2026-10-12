// Temporarily keep only the full-bleed cover layout. Retain the old variant and
// saved choices so the two-layout experiment can be restored without a migration.
export const ENABLE_STANDARD_CARD_APPEARANCE = false;

export function coverImage(post) {
  const images = (post.images || []).filter(image => image.src);
  return images.find(image => image.id === post.coverImageId) || images[0] || null;
}

export function cardAppearance(post) {
  if (!ENABLE_STANDARD_CARD_APPEARANCE) return hasCoverMedia(post) ? 'cover' : 'standard';
  // Existing media samples demonstrate covers; a saved editor choice always wins.
  const choice = post.cardAppearance ?? (['gallery', 'video', 'prod-union-award', 'prod-bts-developer', 'prod-fire-drill'].includes(post.id) ? 'cover' : 'standard');
  return choice === 'cover' && hasCoverMedia(post) ? 'cover' : 'standard';
}

export function hasCoverMedia(post) { return !!coverImage(post) || !!post.videos?.some(video => video.url); }

export function cardImages(post, cover = false) {
  const images = post.images || [];
  const selected = cover ? coverImage(post) : null;
  return selected ? [selected, ...images.filter(image => image !== selected)] : images;
}
