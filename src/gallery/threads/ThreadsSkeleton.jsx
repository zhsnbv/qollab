import { Sk } from '../../components/Skeleton';

// Keep loading placeholders in the same caption, avatar and bubble slots as the list.
export default function ThreadsSkeleton() {
  return <div className="qt-list-body" role="status" aria-label="Загрузка веток" aria-busy="true">
    {[0, 1, 2].map(index => <div className="qt-thread-preview qt-skeleton" key={index} aria-hidden="true">
      <div className="qt-preview-source"><Sk w={[126, 104, 142][index]} h={10} r={4} /></div>
      <div className="msg msg--their msg--last">
        <span className="msg-avatar-slot"><Sk w={40} h={40} circle /></span>
        <div className="msg-col">
          <div className="msg-bubble msg-bubble--with-footer">
            <div className="qt-skeleton-reference">
              <Sk w={18} h={18} r={4} />
              <div><Sk w={76} h={9} r={4} /><Sk w={['86%', '72%', '92%'][index]} h={12} r={4} /></div>
            </div>
            <div className="qt-skeleton-text">
              <Sk w={[96, 128, 112][index]} h={11} r={4} />
              <Sk w="94%" h={13} r={4} />
              <Sk w={['64%', '80%', '48%'][index]} h={13} r={4} />
            </div>
            <div className="qt-skeleton-time"><Sk w={30} h={9} r={4} /></div>
            <div className="qt-replies">
              <span className="qt-skeleton-avatars">{[0, 1, 2].map(avatar => <Sk key={avatar} w={23} h={23} circle />)}</span>
              <span><Sk w={74} h={12} r={4} /></span>
              <Sk w={16} h={16} r={5} />
            </div>
          </div>
        </div>
      </div>
    </div>)}
  </div>;
}
