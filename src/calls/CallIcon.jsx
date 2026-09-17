const asset='/img/calls/icons/';
const icons={videoOn:'video-on.svg',rotate:'camera-rotate.svg',speaker:'imgSpeakerSimpleHigh.svg',video:'imgVideoCameraSlash.svg',mic:'imgMicrophone.svg',more:'imgDotsThreeOutline.svg',end:'imgCallEndFilled.svg',down:'imgIcon.svg',phone:'history-imgIcon1.svg',back:'history-imgIcon.svg',badge:'mini-imgIcon.svg'};
export default function CallIcon({name,size=24,tinted=false}) {
 if(tinted||name==='phone'||name==='videoOn')return <span className="call-icon call-icon-tinted" style={{width:size,height:size,...(name==='videoOn'&&!tinted?{background:'currentColor'}:{}),maskImage:`url(${asset+icons[name]})`,WebkitMaskImage:`url(${asset+icons[name]})`}} aria-hidden="true"/>;
 return <img className="call-icon" src={asset+icons[name]} width={size} height={size} alt="" draggable="false"/>;
}
