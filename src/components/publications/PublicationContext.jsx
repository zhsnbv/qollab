import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';
import PublicationSound from '../../gallery/publications-web/PublicationSound';
import { initialComments } from '../../gallery/publications-web/publicationContent';
import { commentCount } from '../../gallery/publications-mobile/mobileDiscussion';
import { publications, publicationsById } from '../../data/publications';
import { channelList } from '../../data/channels';
import { normalizePublication, mergePublicationState } from './publicationModel';

import { PublicationContext } from './usePublications';
const STORAGE = 'qollab-publications-mobile-v1';
const seeds = Object.fromEntries(publications.map(post => [post.id, post.commentCount ? initialComments : []]));
const load = () => { try { const value = JSON.parse(localStorage.getItem(STORAGE) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } };

export function PublicationsProvider({ children }) {
  const [saved, setSaved] = useState(load), [sheet, setSheet] = useState(null);
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch { /* Session remains usable without storage. */ } }, [saved]);
  const value = useMemo(() => {
    const change = (key, id, value) => setSaved(current => ({ ...current, [key]: { ...current[key], [id]: typeof value === 'function' ? value(current[key]?.[id]) : value } }));
    const resolve = input => {
      const source = typeof input === 'string' ? publicationsById[input] : publicationsById[input?.id] || input;
      if (!source) return null;
      const post = normalizePublication(source, channelList);
      return mergePublicationState(post, saved, commentCount, seeds[post.id]);
    };
    return {
      saved, sheet, setSheet, change, resolve,
      posts: publications.map(resolve),
      threads: id => saved.threads?.[id] ?? seeds[id] ?? [],
      actions: post => ({
        onLike: () => change('likes', post.id, current => !(current ?? post.liked)),
        onComments: () => setSheet({ type: 'comments', post }),
        onShare: () => setSheet({ type: 'share', post }),
        onStats: () => setSheet({ type: 'stats', post }),
      }),
    };
  }, [saved, sheet]);
  return <PublicationContext.Provider value={value}><ConfigProvider prefixCls="qpub" theme={{ token: { colorPrimary: '#ef7f1a', fontFamily: 'var(--font-base)', borderRadius: 16 } }}><PublicationSound>{children}</PublicationSound></ConfigProvider></PublicationContext.Provider>;
}
