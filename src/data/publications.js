import { PUBLICATION_FEED_ORDER } from '../gallery/publications-web/editorialSamples';
import { INITIAL_POSTS } from '../gallery/publications-web/data';
import { basePosts, makePost } from './feed';
import { channelList } from './channels';
import { normalizePublication } from '../components/publications/publicationModel';

const priority = PUBLICATION_FEED_ORDER;
// Both feed surfaces, channels and search use the same IDs and article content.
export const publications = [...INITIAL_POSTS, ...basePosts, ...Array.from({ length: 12 }, (_, i) => makePost(i))]
  .map(post => normalizePublication(post, channelList))
  .sort((a, b) => {
    const media = post => !!(post.images.length || post.videos.length);
    return Number(media(b)) - Number(media(a)) || (priority[a.id] ?? 6) - (priority[b.id] ?? 6);
  });
export const publicationsById = Object.fromEntries(publications.map(post => [post.id, post]));
// Aliases keep the established compact search-result component intact.
export const searchablePublications = publications.map(post => ({ ...post, avatar: post.channelAvatar, excerpt: post.lead, thumb: post.images[0]?.src }));
