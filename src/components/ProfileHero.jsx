import { Plus } from '@phosphor-icons/react';
import { PROFILE_V2 } from '../config';
import './ProfileHero.css';

// Шапка своего профиля. Две версии живут рядом: центрированная — то, что
// проверяем сейчас, прежняя с 3D-линией — на случай отката (см. src/config.js).
export default function ProfileHero({ me, onPhoto }) {
  if (!PROFILE_V2) return <ClassicHero me={me} onPhoto={onPhoto} />;

  return (
    <section className="phero">
      {/* Слот под иллюстрацию: пока мягкая подложка в цвете акцента */}
      <span className="phero-art" aria-hidden="true" />
      <button className="phero-avatar" onClick={onPhoto} aria-label="Фото профиля">
        <img className="ava" src={me.avatar} alt="" />
        <span className="phero-cam">
          <img src="/img/profile/camera.svg" alt="" width="16" height="16" />
        </span>
      </button>
      <h2 className="phero-name">{me.name}</h2>
      <div className="phero-role">{me.role}</div>
      <button className="phero-status"><Plus size={12} weight="bold" />Установить статус</button>
    </section>
  );
}

// Прежняя шапка: оранжевая волна за аватаром, всё выровнено по левому краю.
// Волна — готовая картинка целиком, отдельно под каждую тему; обе версии в
// разметке, нужную показывает CSS.
function ClassicHero({ me, onPhoto }) {
  return (
    <section className="profile-hero">
      <div className="profile-decor" aria-hidden="true">
        <span className="profile-decor-wave">
          <img className="profile-decor-img profile-decor-img--light" src="/img/profile/wave-light.png" alt="" />
          <img className="profile-decor-img profile-decor-img--dark" src="/img/profile/wave-dark.png" alt="" />
        </span>
      </div>
      <div className="profile-head">
        <button className="profile-avatar-wrap" onClick={onPhoto} aria-label="Фото профиля">
          <img className="profile-avatar" src={me.avatar} alt="" />
          <span className="profile-avatar-cam">
            <img src="/img/profile/camera.svg" alt="" width="16" height="16" />
          </span>
        </button>
        <h2 className="profile-name">{me.name}</h2>
        <div className="profile-role">{me.role}</div>
        <button className="status-btn"><Plus size={12} weight="bold" />Установить статус</button>
      </div>
    </section>
  );
}
