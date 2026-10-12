import { INITIAL_POSTS } from '../gallery/publications-web/data';
import { basePosts, makePost } from './feed';
import { channelList } from './channels';
import { normalizePublication } from '../components/publications/publicationModel';

const priority = { news: 0, audit: 1, 'prod-project-aglo': 2 };
// Both feed surfaces, channels and search use the same IDs and article content.
export const publications = [...INITIAL_POSTS, ...basePosts, ...Array.from({ length: 12 }, (_, i) => makePost(i))]
  .map(post => normalizePublication(post, channelList))
  .sort((a, b) => {
    const media = post => !!(post.images.length || post.videos.length);
    return Number(media(b)) - Number(media(a)) || (priority[a.id] ?? 3) - (priority[b.id] ?? 3);
  });
export const publicationsById = Object.fromEntries(publications.map(post => [post.id, post]));
// Aliases keep the established compact search-result component intact.
export const searchablePublications = publications.map(post => ({ ...post, avatar: post.channelAvatar, excerpt: post.lead, thumb: post.images[0]?.src }));
