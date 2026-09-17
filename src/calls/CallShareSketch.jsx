import {MonitorArrowUp,ArrowsOut} from '@phosphor-icons/react';
import Icon from './CallIcon';
import CallWave from './waves/CallWave';
import {VideoCallHeading} from './CallVideoStage';
import './CallShareSketch.css';

// Layout study only: no capture or call state. Kept out of the interactive flow.
export default function CallShareSketch({variant='desktop'}){
 const own=variant==='self',portrait=variant==='phone';
 return <section className="call-screen call-screen-video call-share-sketch">
  <CallWave status="active" paused/>
  <header className="call-header"><span className="sketch-collapse"><Icon name="down"/></span><VideoCallHeading call={{name:'Арман Асхатов',seconds:48}}/><span className="call-header-spacer"/></header>
  <div className="share-study-content"><div className="share-study-title"><MonitorArrowUp size={16}/><span>{own?'Вы показываете экран':'Экран Армана'}</span>{!own&&<ArrowsOut size={18}/>}</div>
   <div className={`share-study-stage ${portrait?'portrait':''}`}>
    {own?<div className="share-study-self"><MonitorArrowUp size={36}/><strong>Вы делитесь экраном</strong><p>Собеседник видит всё, что вы открываете на телефоне.</p><span className="calls-primary">Остановить демонстрацию</span></div>:portrait?<div className="share-study-phone"><span className="share-phone-time">10:16</span><strong>Мои задачи</strong><small>Сегодня · 3 задачи</small>{['Обсудить макеты звонков','Согласовать новый сценарий','Подготовить релиз'].map((text,i)=><div className="share-phone-task" key={text}><span>{i+1}</span><div>{text}<small>Qollab · продуктовая команда</small></div></div>)}<div className="share-phone-tabs">Главная　 Задачи　 Чаты</div></div>:<img src="/img/calls/shared-release-plan.svg" alt="Горизонтальный экран компьютера вписан целиком"/>}
   </div>
   <div className="share-study-participants"><div className="share-study-person"><img src="/media/calls/colleague-poster.jpg" alt="Арман"/><span>Арман</span></div><div className={`share-study-person ${portrait?'camera-off':''}`}>{portrait?<><img className="share-study-avatar" src="/img/calls/self-camera.png" alt=""/><Icon name="video" size={18}/></>:<img src="/img/calls/self-camera.png" alt="Вы"/>}<span>Вы</span></div></div>
  </div>
  <footer className="call-dock"><div className="share-study-controls">{[['speaker','Динамик'],['videoOn','Видео'],['mic','Микрофон'],['more','Еще'],['end','Завершить']].map(([icon,label])=><div className="call-control" key={icon}><span className="call-control-circle"><Icon name={icon}/></span><span>{label}</span></div>)}</div></footer>
 </section>;
}
