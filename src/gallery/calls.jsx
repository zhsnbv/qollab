import DMChat from '../screens/DMChat';
import {makeCall,people} from '../calls/model';
const person=people[0];
const chat={profileId:'arman',title:person.name,avatar:person.avatar,initials:person.initials,fresh:true,online:true};
const call=(status,extra={})=>({...makeCall({status,name:person.name,chatId:'arman',person}),...(status==='active'||status==='reconnecting'?{seconds:48,connectedAt:1}:{}),...extra});
const entry=(id,title,status,extra={},fixture={},note)=>({id:`call-${id}`,title,note,route:{pathname:'/chats/dm',state:{chat}},render:()=> <DMChat/>,fixture:{call:status?call(status,extra):null,...fixture}});
const event=(id,direction,status,seconds=0)=>({...call(status),id,direction,seconds,createdAt:1,connectedAt:seconds?1:null,time:'10:16'});
const history=[event('h6','outgoing','canceled'),{...event('h5','outgoing','ended',10),deliveryStatus:'read'},event('h4','incoming','unanswered'),event('h3','incoming','declined'),event('h2','incoming','busy'),event('h1','incoming','ended',48)];
export const CALLS_GROUP={id:'calls',title:'Звонки 1 на 1',hint:'Каждый кейс — отдельный экран 402×820. Состояния зафиксированы. Настройки волн и материалы для разработки — в этом разделе.',items:[
 entry('incoming','Входящий · аудио','incoming'),
 entry('incoming-video','Входящий · видео','incoming',{media:'video',video:true}),
 entry('incoming-locked','Входящий · экран блокировки','incoming',{locked:true},{},'Визуальный ориентир для системного экрана; окончательное оформление задаёт ОС.'),
 entry('connecting','Подключение','connecting'),entry('ringing','Исходящий · вызов','ringing'),
 entry('active','Разговор · хорошее соединение','active'),
 entry('muted','Ваш микрофон выключен','active',{muted:true}),
 entry('remote-muted','Микрофон собеседника выключен','active',{remoteMuted:true}),
 entry('video','Видео · камера собеседника выключена','active',{video:true,media:'video'}),
 entry('quality-local','Нестабильное соединение · у вас','active',{quality:'poor',qualitySide:'local'}),
 entry('quality-remote','Нестабильное соединение · у собеседника','active',{quality:'poor',qualitySide:'remote'}),
 entry('reconnecting','Восстанавливаем соединение','reconnecting',{reconnectDeadline:15000},{},'Окно восстановления 15 секунд; ID и время разговора сохраняются.'),
 entry('busy','Линия занята','busy',{}, {},'У вызываемого — пропущенный в переписке; у вызывающего — «Линия занята».'),
 entry('canceled','Вызов отменён','canceled'),entry('declined','Вызов отклонён','declined'),entry('unanswered','Не отвечает','unanswered'),
 entry('unavailable','Абонент недоступен · причина неизвестна','unavailable'),
 entry('unavailable-push','Недоступен · доставка уведомлений',null,{}, {failureCall:call('unavailable',{unavailableReason:'Не удалось доставить уведомление о звонке. Напишите в чат.'})},'Диалог после ухода экрана. Конкретная причина — только если её подтвердил сервер.'),
 entry('unavailable-mic','Недоступен · микрофон',null,{}, {failureCall:call('unavailable',{unavailableReason:'Звонок пока недоступен: у собеседника не подключён микрофон. Напишите в чат.'})},'Диалог после ухода экрана. Причина известна из ответа приложения собеседника.'),
 entry('unavailable-sleep','Недоступен · приложение не в сети',null,{}, {failureCall:call('unavailable',{unavailableReason:'Приложение собеседника сейчас не в сети. Попробуйте позже или напишите в чат.'})}),
 entry('failed','Связь не восстановлена','failed',{seconds:48,connectedAt:1}),entry('ended','Разговор завершён','ended',{seconds:48,connectedAt:1}),entry('elsewhere','Ответ на другом устройстве','elsewhere'),
 ...['busy','declined','unanswered','unavailable','failed'].map(status=>entry(`dialog-${status}`,`Диалог · ${ {busy:'линия занята',declined:'вызов отклонён',unanswered:'нет ответа',unavailable:'абонент недоступен',failed:'не удалось позвонить'}[status]}`,null,{}, {failureCall:call(status)},'Появляется после полного ухода экрана звонка вниз.')),
 entry('mini','Свёрнутый разговор','active',{minimized:true}),entry('mini-reconnect','Свёрнутый · восстановление','reconnecting',{minimized:true}),
 entry('route','Источник звука','active',{}, {sheet:'route'}),entry('more','Действия со звонком','active',{}, {sheet:'more'}),
 entry('mic','Доступ к микрофону · первый запрос',null,{}, {sheet:'mic',micRequest:{person,name:person.name,chatId:'arman'}}),
 entry('mic-denied','Доступ к микрофону · отказ',null,{}, {sheet:'mic',micRequest:{person,name:person.name,chatId:'arman'},micDenied:true}),
 entry('mic-settings','Микрофон · инструкция в том же листе',null,{}, {sheet:'mic',settingsHelp:true,micRequest:{person,name:person.name,chatId:'arman'},micDenied:true}),
 entry('camera','Включение камеры','active',{}, {sheet:'camera'}),entry('camera-denied','Камера недоступна','active',{}, {issue:'camera-denied'}),
 entry('camera-permission-denied','Камера · доступ выключен','active',{}, {sheet:'camera',cameraDenied:true}),
 entry('share','Запуск демонстрации','active',{}, {sheet:'share'}),entry('sharing','Вы показываете экран','active',{sharing:true}),
 entry('remote-sharing','Собеседник показывает экран','active',{remoteSharing:true,remoteShareImage:'/img/calls/shared-release-plan.svg'}, {},'Переданный экран вписан целиком. В интерфейсе можно развернуть просмотр; управление звонком остаётся доступным.'),
 entry('remote-sharing-reconnect','Демонстрация собеседника · восстановление','reconnecting',{remoteSharing:true,remoteShareImage:'/img/calls/shared-release-plan.svg',reconnectDeadline:15000}),
 entry('share-error','Демонстрация не началась','active',{}, {issue:'share-denied'}),
 entry('interruption','Системное прерывание','active',{muted:true}, {issue:'interruption'}),
 entry('second','Второй входящий','active',{}, {pending:{name:'Аяжан С.',status:'incoming'}}),
 entry('bubbles','Входящие и исходящие · история в чате',null,{}, {history}),
 entry('bubble-single','Одиночный звонок · острый угол',null,{}, {history:[event('single','outgoing','ended',48)]}),
 entry('wave-lite','Волны · облегчённый режим','active',{}, {waveQuality:'lite'},'Без runtime blur, зерна и светового слоя.'),
 entry('wave-static','Волны · статичный режим','active',{}, {waveQuality:'static'},'Для энергосбережения и reduced motion.'),
]};
