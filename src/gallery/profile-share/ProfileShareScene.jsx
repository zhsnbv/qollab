import { useState } from 'react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PersonProfile from '../../screens/PersonProfile';
import DMChat from '../../screens/DMChat';
import ChatRoom from '../../screens/ChatRoom';
import { DeviceHost } from '../../components/Portal';
import { ACTIVE_SHARE_CHATS, recipientChat } from '../../utils/sharing';
import { SHARE_CASES, shareEntry } from './shareCases';
import './ProfileShareReview.css';

function DemoChatList() {
  const navigate = useNavigate();
  return <section className="ps-demo-chats"><header><h1>Чаты</h1><button onClick={() => navigate('/person', { state: { id: 'ayazhan', online: true } })}>Профиль Аяжан</button></header>{ACTIVE_SHARE_CHATS.map(chat => <button className="fwd-row" key={chat.id} onClick={() => navigate(chat.id === 'prodev' ? '/chats/prodev' : '/chats/dm', { state: { chat: recipientChat(chat) } })}><span className="fwd-ava">{chat.avatar ? <img src={chat.avatar} alt="" /> : chat.initials || chat.name.slice(0, 1)}</span><span className="fwd-name">{chat.name}</span></button>)}</section>;
}
function SceneRoutes({ capture }) {
  const location = useLocation();
  return <Routes>
    <Route path="/person" element={<PersonProfile key={location.key} sharePreview={{ ...location.state?.sharePreview, capture }} />} />
    <Route path="/chats/dm" element={<DMChat key={location.state?.chat?.profileId || location.key} sharePreview={{ ...location.state?.sharePreview, capture: capture && !!location.state?.sharePreview }} />} />
    <Route path="/chats/prodev" element={<ChatRoom />} />
    <Route path="*" element={<DemoChatList />} />
  </Routes>;
}
export default function ProfileShareScene({ scenario = 'profile', capture = false, embedded = false }) {
  const [host, setHost] = useState(null);
  const item = SHARE_CASES.find(item => item.id === scenario) || SHARE_CASES[0];
  const contents = <SceneRoutes capture={capture} />;
  return <div className={`ps-phone ${embedded ? 'is-embedded' : ''}`} ref={setHost} data-share-state={scenario}>
    {host && <DeviceHost.Provider value={host}>{embedded ? contents : <MemoryRouter initialEntries={['/chats', shareEntry(item, capture)]} initialIndex={1}>{contents}</MemoryRouter>}</DeviceHost.Provider>}
  </div>;
}
