import * as T from 'three';
import {createWorlds,type RoomId,type World} from './worlds';
export function mountLab(host:HTMLElement,onLost:()=>void){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.background=new T.Color('#132833');scene.fog=new T.Fog('#132833',55,110);
 const camera=new T.PerspectiveCamera(42,1,.1,150);const hemi=new T.HemisphereLight('#e0eef1','#687c71',2.5);scene.add(hemi);const sun=new T.DirectionalLight('#ffe3bc',3.4);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24});sun.shadow.normalBias=.045;scene.add(sun);
 const fill=new T.DirectionalLight('#87bfc9',1.5);fill.position.set(12,6,-8);scene.add(fill);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let paused=motion.matches,dead=false,frame=0,last=0,time=0,yaw=.58,pitch=.62,distance=20;
 const target=new T.Vector3(),look=new T.Vector3(),desired=new T.Vector3();let current:World;let room:RoomId='delft';let intro=false,introT=0;let transition:{id:RoomId,time:number}|null=null;
 const wake=()=>{if(!frame&&!dead&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}};
 const worlds=createWorlds(wake,renderer.capabilities.getMaxAnisotropy());
 const controls={onAction:(_action:string)=>{},onHover:(_label:string,_x:number,_y:number)=>{},onRoom:(_id:RoomId,_world:World)=>{},onChange:()=>{},onIntro:(_playing:boolean)=>{},onFade:(_fade:boolean)=>{},get paused(){return paused;},get room(){return room;},toggle(){paused=!paused;if(paused&&intro)skipIntro();wake();},go,overview,skipIntro,select(_index:number){},activate(_index:number){},dispatch};
 function orbit(){desired.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);}
 function show(id:RoomId){if(current)scene.remove(current.group);current=worlds.get(id);room=id;scene.add(current.group);target.copy(current.target);look.copy(target);yaw=id==='delft'?.1:.58;pitch=id==='delft'?.82:.62;distance=current.distance*(innerWidth<700?1.38:1);orbit();camera.position.copy(desired);camera.lookAt(look);outline.visible=false;heat(null);controls.onHover('',0,0);controls.onRoom(id,current);wake();}
 function go(id:RoomId){if(intro)skipIntro();if(id===room){overview();return;}if(motion.matches){show(id);return;}transition={id,time:0};controls.onFade(true);wake();}
 function overview(){target.copy(current.target);yaw=room==='delft'?.1:.58;pitch=room==='delft'?.82:.62;distance=current.distance*(innerWidth<700?1.38:1);orbit();wake();}
 function dispatch(action:string){if(action.startsWith('room:'))go(action.slice(5) as RoomId);else controls.onAction(action);}
 function skipIntro(){intro=false;try{sessionStorage.setItem('portfolio-house-intro','seen');}catch{}controls.onIntro(false);show('house');}
 const outline=new T.Box3Helper(new T.Box3(),0xf4d59a);outline.visible=false;scene.add(outline);
 let hot:T.Object3D|null=null;
 function heat(o:T.Object3D|null){if(hot===o)return;for(const [target,on] of [[hot,false],[o,true]] as const)target?.children.forEach(c=>{if(c.userData.marker)c.userData.hot=on;});hot=o;wake();}
 function enclose(o:T.Object3D){outline.box.makeEmpty();o.traverse(c=>{if(c instanceof T.Mesh)outline.box.expandByObject(c);});}
 function tick(stamp:number){frame=0;if(dead||document.hidden)return;const dt=Math.min((stamp-(last||stamp))/1000,.05);last=stamp;if(!paused)time+=dt;
  if(intro){introT+=dt;const walker=current.group.children.find(c=>c.userData.intro);if(walker){walker.visible=true;const p=T.MathUtils.smoothstep(introT,1.8,6.2);walker.position.set(3.62,0,2.3-p*2.48);walker.rotation.y=Math.PI;}const k=T.MathUtils.smoothstep(introT,0,3.8);target.lerpVectors(new T.Vector3(2,0,1),new T.Vector3(3.62,.8,-.5),k);distance=T.MathUtils.lerp(43,8,k);yaw=.42;pitch=T.MathUtils.lerp(.82,.42,k);orbit();if(introT>6.5){if(walker)walker.visible=false;skipIntro();}}
  if(transition){transition.time+=dt;if(transition.time>.32){const next=transition.id;transition=null;show(next);controls.onFade(false);}}
  if(!paused)current.tick(time,dt);
  look.lerp(target,motion.matches?1:.12);camera.position.lerp(desired,motion.matches?1:.12);camera.lookAt(look);renderer.render(scene,camera);
  if(!paused||intro||transition||camera.position.distanceTo(desired)>.01||look.distanceTo(target)>.01)frame=requestAnimationFrame(tick);
 }
 const raycaster=new T.Raycaster();const ndc=new T.Vector2();
 function hit(e:PointerEvent){const r=host.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(ndc,camera);const hits=raycaster.intersectObject(current.group,true);for(const h of hits){let o:T.Object3D|null=h.object;while(o&&!o.userData.action)o=o.parent;if(o)return o;}return null;}
 let down:{x:number;y:number;lastX:number;lastY:number;moved:boolean}|null=null;
 renderer.domElement.addEventListener('pointerdown',e=>{if(intro)return;down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(intro)return;if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;if(down.moved){yaw-=(e.clientX-down.lastX)*.006;pitch=T.MathUtils.clamp(pitch+(e.clientY-down.lastY)*.005,.15,1.35);orbit();wake();}down.lastX=e.clientX;down.lastY=e.clientY;return;}const o=hit(e);outline.visible=!!o;if(o)enclose(o);heat(o);renderer.domElement.style.cursor=o?'pointer':'grab';controls.onHover(o?.userData.label||'',e.clientX,e.clientY);wake();});
 renderer.domElement.addEventListener('pointerup',e=>{if(down&&!down.moved){const o=hit(e);if(o)dispatch(o.userData.action);}down=null;});renderer.domElement.addEventListener('pointercancel',()=>down=null);renderer.domElement.addEventListener('pointerleave',()=>{outline.visible=false;heat(null);controls.onHover('',0,0);wake();});
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();if(intro)return;distance=T.MathUtils.clamp(distance+e.deltaY*.012,5,75);orbit();wake();},{passive:false});
 const resized=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(width&&height){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();wake();}});
 const changed=()=>{paused=motion.matches;if(paused&&intro)skipIntro();controls.onChange();wake();};motion.addEventListener('change',changed);document.addEventListener('visibilitychange',wake);
 const dispose=()=>{if(dead)return;dead=true;cancelAnimationFrame(frame);resized.disconnect();worlds.dispose();renderer.dispose();renderer.domElement.remove();motion.removeEventListener('change',changed);document.removeEventListener('visibilitychange',wake);};renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();onLost();});window.addEventListener('pagehide',e=>{if(!e.persisted)dispose();});
 host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');resized.observe(host);
 let seen=false;try{seen=sessionStorage.getItem('portfolio-house-intro')==='seen';}catch{}intro=!seen&&!motion.matches;show(intro?'delft':'house');queueMicrotask(()=>{controls.onRoom(room,current);controls.onIntro(intro);});wake();return controls;
}
