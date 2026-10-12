import { channelList } from '../../data/channels';

export const OWN_CHANNEL_ID = 'erg-news';
export function publicationChannelId(post, ownChannel) {
  if (post.channelId) return post.channelId;
  if (post.channel === 'Новости ERG') return 'erg-production';
  if (!post.channel || post.channel === ownChannel.name || post.channel === 'ERG News') return OWN_CHANNEL_ID;
  return channelList.find(channel => channel.name === post.channel)?.id || `channel-${post.channel}`;
}

export function publicationChannels(posts, ownChannel, subscriptions) {
  const own = { ...channelList[0], ...ownChannel, id: OWN_CHANNEL_ID, required: false, about: ownChannel.description };
  const discovered = [];
  for (const post of posts) {
    const id = publicationChannelId(post, ownChannel);
    if (id === OWN_CHANNEL_ID || channelList.some(channel => channel.id === id) || discovered.some(channel => channel.id === id)) continue;
    discovered.push({ id, name: post.channel, avatar: post.channelAvatar || '/img/posts/ch-erg-news.png', cover: post.images?.[0]?.src, about: '', subscribed: true });
  }
  return [own, ...discovered, ...channelList.slice(1)].map(channel => ({ ...channel,
    subscribed: channel.id === OWN_CHANNEL_ID ? ownChannel.subscribed : channel.required || (subscriptions[channel.id] ?? channel.subscribed),
    count: posts.filter(post => publicationChannelId(post, ownChannel) === channel.id).length,
  }));
}
