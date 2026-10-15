const ASSET = '/img/publications-web/';

// Exact bundled URLs only: uploaded/editor-selected media must remain intact.
export const LEGACY_PUBLICATION_MEDIA = {
  'prod-power-plant.webp': 'prod-power-plant-02.webp',
  'prod-furnace-01.webp': 'prod-furnace-02.webp',
  'prod-jig-machine-01.webp': 'prod-jig-machine-02.webp',
  'prod-balance-01.webp': 'prod-balance-02.webp',
  'prod-fire-drill.webp': 'clean-aktobe-fire-drill.webp',
  'prod-union-award.webp': 'clean-award-trophy.webp',
  'prod-bts-developer.webp': 'clean-developer-workspace.webp',
  'prod-aglo-project-01.webp': 'clean-aksu-conveyors.webp',
  'prod-aglo-project-02.webp': 'clean-aksu-agglomeration.webp',
  'prod-aglo-project-03.webp': 'clean-aksu-agglomeration.webp',
};

const replacement = src => src?.startsWith(ASSET) ? LEGACY_PUBLICATION_MEDIA[src.slice(ASSET.length)] : null;

export function refreshPublicationMedia(post) {
  let changed = false;
  let coverImageId = post.coverImageId;
  const images = [];
  for (const image of post.images || []) {
    const name = replacement(image.src);
    const next = name ? { ...image, name, src: ASSET + name } : image;
    changed ||= !!name;
    // Replacing a poster with a clean sibling must not show that photo twice.
    const duplicate = images.find(other => other.src === next.src && other.caption === next.caption && other.status === next.status);
    if (duplicate && (name || (post.images || []).some(original => replacement(original.src) === next.src.slice(ASSET.length)))) {
      changed = true;
      if (coverImageId === image.id) coverImageId = duplicate.id;
    } else images.push(next);
  }
  const videos = (post.videos || []).map(video => {
    const name = replacement(video.poster);
    if (!name) return video;
    changed = true;
    return { ...video, poster: ASSET + name };
  });
  if (!changed) return post;
  return { ...post, images, ...(post.videos ? { videos } : {}), ...(coverImageId !== undefined ? { coverImageId } : {}) };
}
