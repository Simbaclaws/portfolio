import { routePoints, routeStops } from '../data/delft-route';
import * as T from 'three';
export type RoomId = 'house'|'delft'|'dungeon'|'lab'|'health'|'cinema';
export type Action = {label:string; action:string};
export type World = {group:T.Group; tick:(t:number,dt:number)=>void; actions:Action[]; title:string; subtitle:string; distance:number; target:T.Vector3};
export function createWorlds(refresh:()=>void,anisotropy=1){
 const textures:T.Texture[]=[];
 const imageTextures=new Map<string,T.Texture>();
 function screenshot(name:string){let texture=imageTextures.get(name);if(!texture){texture=new T.TextureLoader().load(import.meta.env.BASE_URL+'images/'+name+'.webp',refresh);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=anisotropy;imageTextures.set(name,texture);textures.push(texture);}return texture;}
 const materials=new Map<string,T.MeshStandardMaterial>();
 const mat=(color:string,metal=.05,rough=.65)=>{const key=color+metal+rough;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(key)!;};
 const C={wood:mat('#ad7751'),edge:mat('#d8bb84'),wall:mat('#718b8b'),floor:mat('#314b53'),dark:mat('#152831'),steel:mat('#7c9b9d',.65,.3),white:mat('#dae6df'),red:mat('#bc3846'),orange:mat('#e8ad55'),skin:mat('#d4a17c'),green:mat('#6c9675'),blue:mat('#5d94ad'),black:mat('#10202a')};
 const glow=(color:string,strength=1)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:strength,roughness:.4});
 const mesh=(p:T.Object3D,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const box=(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material)=>mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);
 const sphere=(p:T.Object3D,r:number,x:number,y:number,z:number,m:T.Material,s=16)=>mesh(p,new T.SphereGeometry(r,s,10),m,x,y,z);
 const cyl=(p:T.Object3D,r:number,h:number,x:number,y:number,z:number,m:T.Material,n=16)=>mesh(p,new T.CylinderGeometry(r,r,h,n),m,x,y,z);
 const cone=(p:T.Object3D,r:number,h:number,x:number,y:number,z:number,m:T.Material,n=6)=>mesh(p,new T.ConeGeometry(r,h,n),m,x,y,z);
 const group=(p:T.Object3D,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 const interactive=(o:T.Object3D,label:string,action:string)=>{o.userData={label,action};return o;};
 const rod=(p:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,m:T.Material)=>{const v=b.clone().sub(a);const o=cyl(p,r,v.length(),0,0,0,m,8);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;};
 const finish=(t:T.CanvasTexture)=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=anisotropy;textures.push(t);return t;};
 // Screen copy: the whole block is scaled down until the longest line fits, so
 // nothing is silently cropped at the edge of the canvas.
 function textTexture(lines:string[],bg='#10232c',fg='#d8f3d3',width=768,height=432){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const pad=width*.05,rows=Math.max(lines.length,1),font=(size:number)=>`500 ${size}px ui-monospace,Menlo,Consolas,monospace`;
  let size=Math.min(height/(rows*1.45),height*.5);ctx.font=font(size);
  size*=Math.min(1,(width-pad*2)/Math.max(1,...lines.map(line=>ctx.measureText(line).width)));ctx.font=font(size);
  ctx.fillStyle=fg;ctx.textBaseline='middle';const step=size*1.45,top=(height-step*(rows-1))/2;
  lines.forEach((line,i)=>ctx.fillText(line,pad,top+i*step));return finish(new T.CanvasTexture(c));}
 // Signage: the canvas keeps the plate's aspect ratio so glyphs are never
 // stretched, and the caption is grown until it fills the plate rather than
 // sitting small in one corner.
 function signTexture(text:string,w:number,h:number,fg='#f1ffd6',bg='#0b1c24'){
  const cw=Math.max(64,Math.min(2048,Math.round(w*480))),ch=Math.max(32,Math.min(1024,Math.round(h*480)));
  const c=document.createElement('canvas');c.width=cw;c.height=ch;const ctx=c.getContext('2d')!;
  ctx.fillStyle=bg;ctx.fillRect(0,0,cw,ch);
  const inset=Math.max(1,ch*.05);ctx.strokeStyle='#e8ffbc38';ctx.lineWidth=Math.max(1,ch*.03);ctx.strokeRect(inset,inset,cw-inset*2,ch-inset*2);
  const rows=text.split('\n'),font=(size:number)=>`700 ${size}px ui-monospace,Menlo,Consolas,monospace`;
  const maxWidth=cw-ch*.4,maxHeight=ch*(rows.length>1?.78:.62);
  const setFont=(size:number)=>{ctx.font=font(size);ctx.letterSpacing=(size*.07).toFixed(2)+'px';};
  const widest=(size:number)=>{setFont(size);return Math.max(1,...rows.map(row=>ctx.measureText(row).width));};
  let size=maxHeight/(.72+1.18*(rows.length-1));
  for(let i=0;i<5;i++){const fit=maxWidth/widest(size);if(fit>=1)break;size*=fit;}
  setFont(size);const cap=ctx.measureText(rows[0]).actualBoundingBoxAscent,step=size*1.18;
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  const first=ch/2-(cap+step*(rows.length-1))/2+cap;
  rows.forEach((row,i)=>ctx.fillText(row,cw/2,first+i*step));
  return finish(new T.CanvasTexture(c));}
 function plane(p:T.Object3D,w:number,h:number,x:number,y:number,z:number,texture:T.Texture){const m=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false});const o=mesh(p,new T.PlaneGeometry(w,h),m,x,y,z);o.castShadow=false;o.receiveShadow=false;return o;}
 function label(p:T.Object3D,text:string,x:number,y:number,z:number,w=2,h=Math.min(.56,Math.max(.15,w*.26))){return plane(p,w,h,x,y,z,signTexture(text,w,h));}
 function imageScreen(p:T.Object3D,name:string,w:number,h:number,x:number,y:number,z:number){const m=new T.MeshBasicMaterial({color:'#d8ebe6'});const o=mesh(p,new T.PlaneGeometry(w,h),m,x,y,z);o.castShadow=false;m.map=screenshot(name);m.needsUpdate=true;return o;}
 function roomBase(g:T.Group,w=14,d=11,wall=C.wall){box(g,w,.25,d,0,-.15,0,C.floor);box(g,w,4.7,.2,0,2.2,-d/2,wall);box(g,.2,4.7,d,-w/2,2.2,0,wall);for(let x=-w/2+.6;x<w/2;x+=1.2)box(g,.018,.012,d,x,-.017,0,C.edge);box(g,w,.14,.17,0,.12,-d/2+.12,C.edge);}
 function door(p:T.Object3D,x:number,z:number,word:string,action:string,kind='wood'){
  const g=group(p,x,0,z);interactive(g,word,action);box(g,2.05,3.35,.3,0,1.65,0,C.dark);
  const leaf=box(g,1.65,2.95,.2,0,1.5,.2,kind==='lab'?C.steel:C.wood);leaf.userData.door=true;
  if(kind==='dungeon'){for(let y=.45;y<2.8;y+=.75)box(g,1.6,.12,.07,0,y,.34,C.dark);}
  if(kind==='lab'){box(g,.06,2.7,.05,0,1.5,.33,C.dark);label(g,'AIRLOCK',0,1.5,.36,1.25);}else sphere(g,.075,.58,1.35,.36,C.orange);
  label(g,word.toUpperCase(),0,3.65,.25,2.1);return g;
 }
 function person(p:T.Object3D,x:number,z:number,options:{hat?:boolean;seated?:boolean;bare?:boolean;glasses?:boolean}={}){
  const g=group(p,x,0,z);const seated=options.seated;const torsoY=seated?1.05:1.15;
  const body=box(g,.5,.6,.28,0,torsoY,0,options.bare?C.skin:C.dark);body.geometry.dispose();body.geometry=new T.CapsuleGeometry(.23,.28,4,10); // soft silhouette
  sphere(g,.25,0,torsoY+.58,0,C.skin);sphere(g,.07,0,torsoY+.56,.235,C.skin);
  if(options.hat){
   // A brimmed hat with a crown and band: intentionally not a baseball cap.
   cyl(g,.34,.05,0,torsoY+.75,.01,C.red,24);
   cyl(g,.22,.25,0,torsoY+.89,0,C.red,24);
   cyl(g,.225,.045,0,torsoY+.82,0,C.black,24);
   const crownTop=cyl(g,.17,.035,0,torsoY+1.025,0,C.red,24);crownTop.scale.x=.78;
  }
  if(options.glasses||options.hat){for(const x of [-.105,.105]){mesh(g,new T.TorusGeometry(.09,.018,6,20),C.black,x,torsoY+.61,.235);const lens=plane(g,.145,.09,x,torsoY+.61,.24,textTexture([''],'#6b362c','#6b362c',32,32));lens.visible=!!options.glasses;}box(g,.045,.02,.02,0,torsoY+.61,.24,C.black);}
  const legs:T.Object3D[]=[];for(const x of [-.14,.14]){if(seated){box(g,.19,.2,.5,x,.67,.16,C.blue);legs.push(box(g,.18,.55,.18,x,.37,.37,C.blue));box(g,.21,.12,.34,x,.08,.46,C.dark);}else{legs.push(box(g,.2,.65,.2,x,.42,0,options.bare?C.skin:C.blue));box(g,.23,.13,.35,x,.06,.08,C.dark);if(options.bare)box(g,.22,.32,.23,x,.72,0,C.blue);}}
  const arms:T.Object3D[]=[];for(const sign of [-1,1]){const arm=group(g,sign*.31,torsoY+.16,0);box(arm,.15,.46,.16,0,-.2,0,options.bare?C.skin:C.dark);sphere(arm,.085,0,-.43,0,C.skin);if(seated)arm.rotation.x=-.9;arms.push(arm);}
  return {group:g,legs,arms};
 }
 function chair(p:T.Object3D,x:number,z:number,m=C.blue){const g=group(p,x,0,z);box(g,.85,.2,.8,0,.53,0,m);box(g,.85,.95,.2,0,1,.38,m);for(const xx of [-.3,.3])for(const zz of [-.25,.25])box(g,.08,.45,.08,xx,.22,zz,C.dark);return g;}
 function plant(p:T.Object3D,x:number,z:number){cyl(p,.25,.4,x,.2,z,C.wood);for(let i=0;i<5;i++){const leaf=sphere(p,.23,x+Math.sin(i*2)*.15,.65+i*.1,z+Math.cos(i*2)*.15,C.green);leaf.scale.set(.6,1.5,.5);}}
 function tv(p:T.Object3D,x:number,z:number,name='lumen',w=2.5){const g=group(p,x,0,z);interactive(g,'Filmhuis Lumen','project:4');box(g,w+.2,w*.6+.2,.18,0,1.6,0,C.black);imageScreen(g,name,w,w*.5625,0,1.6,.11);box(g,.12,.8,.12,0,.6,0,C.steel);box(g,1.2,.12,.6,0,.13,0,C.dark);return g;}
 function makeHouse():World{
  const g=new T.Group();roomBase(g);
  door(g,-5.35,-5.25,'Delft','room:delft');door(g,-2.85,-5.25,'Dungeon','room:dungeon','dungeon');label(g,'MAKE YOURSELF AT HOME',.3,3.2,-5.15,4);
  const stairs=group(g,4.65,0,-3.5);interactive(stairs,'Health · upstairs','room:health');for(let i=0;i<8;i++)box(stairs,1.45,.24*(i+1),.4,0,.12*(i+1),1.5-i*.4,C.wood);label(stairs,'HEALTH',0,3.3,-.8,2.2);for(const x of [-.83,.83])rod(stairs,new T.Vector3(x,1,1.6),new T.Vector3(x,2.8,-1.4),.035,C.edge);
  // Curved desktop with an inward arc, three independent displays, split keyboard.
  const desk=group(g,-2.1,0,.15);const shape=new T.Shape();shape.moveTo(-2.5,-.75);shape.quadraticCurveTo(0,-1.6,2.5,-.75);shape.lineTo(2.5,1);shape.quadraticCurveTo(0,.15,-2.5,1);shape.closePath();const top=mesh(desk,new T.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.03}),C.wood,0,1.18,0);top.rotation.x=-Math.PI/2;
  for(const x of [-2.15,2.15]){box(desk,.12,1.2,1.25,x,.6,0,C.dark);box(desk,.7,.07,1.5,x,.06,0,C.dark);}
  const screens:T.Mesh[]=[];const shots=['scenery-en-zo','cyto','diginova','lumen','shuttle'];
  for(let i=0;i<3;i++){const monitor=group(desk,(i-1)*1.5,1.85,-.65);monitor.rotation.y=(1-i)*.14;box(monitor,1.43,.88,.1,0,0,0,C.black);box(monitor,.08,.5,.08,0,-.55,0,C.steel);box(monitor,.6,.05,.32,0,-.8,.04,C.dark);
   if(i===0){interactive(monitor,'Projects · browser monitor','project:0');screens.push(imageScreen(monitor,'scenery-en-zo',1.32,.74,0,0,.065));label(monitor,'PROJECT\nBROWSER',0,.79,.09,1.42,.62);}
   if(i===1){interactive(monitor,'Neovim · coding','about');plane(monitor,1.32,.74,0,0,.065,textTexture(['NVIM   portfolio.ts','const world = createHome();','  doors.connect("Delft");','  render(ideas);','NORMAL  main  UTF-8'],'#142c32','#acde98'));}
   if(i===2){interactive(monitor,'ChatGPT · building with AI','about');plane(monitor,1.32,.74,0,0,.065,textTexture(['ChatGPT','You: Let us build a world.','Assistant: Start at home.','Make every object a story.'],'#edf1ec','#25443a'));}
  }
  const keyboard=group(desk,-.2,1.41,.26);interactive(keyboard,'Kinesis Advantage360 · split keyboard','about');for(const sign of [-1,1]){const half=group(keyboard,sign*.28,0,0);half.rotation.z=-sign*.14;half.rotation.y=sign*.17;box(half,.43,.09,.4,0,0,0,C.black);for(let r=0;r<4;r++)for(let c=0;c<5;c++){const y=-.02*Math.sin(c*Math.PI/4);box(half,.052,.027,.055,(c-2)*.066,.064+y,(r-1.5)*.074,C.steel);}for(let k=0;k<3;k++)box(half,.053,.035,.06,-sign*.13,.1,.15+k*.035,C.white);}label(desk,'ADVANTAGE 360',0,1.26,.6,1.1);
  const avatar=person(g,-2.1,1.35,{hat:true,seated:true});avatar.group.rotation.y=Math.PI;interactive(avatar.group,'About me · the person in the red hat','about');chair(g,-2.1,1.35,C.dark);
  const sofa=group(g,3.6,0,1.45);box(sofa,3.2,.5,1.25,0,.4,0,C.blue);box(sofa,3.2,.85,.3,0,.95,.53,C.blue);for(const x of [-1.5,1.5])box(sofa,.3,.75,1.3,x,.65,0,C.blue);for(const x of [-.85,0,.85])box(sofa,.77,.12,.85,x,.71,-.05,C.wall);tv(g,3.5,-.8);
  box(g,1.5,.1,.85,3.3,.55,3.1,C.wood);for(const x of [2.7,3.9])box(g,.06,.55,.6,x,.27,3.1,C.dark);cyl(g,.11,.18,3.15,.7,3.1,C.white);
  // Kitchen along the cutaway left wall, coffee machine and labelled bottle.
  for(let z=-2.3;z<2.8;z+=1.05){box(g,1.2,1,1,-6.1,.5,z,C.wall);box(g,1.3,.1,1.05,-6.1,1.05,z,C.edge);box(g,.05,.06,.4,-5.46,.7,z,C.steel);}
  box(g,.7,.08,.65,-6.1,1.15,-1.3,C.steel);const tap=mesh(g,new T.TorusGeometry(.15,.027,6,12,Math.PI),C.steel,-6.05,1.32,-1.6);tap.rotation.y=Math.PI/2;
  const coffee=group(g,-6,1.13,1);interactive(coffee,'Coffee machine · take a break','coffee');box(coffee,.55,.62,.5,0,.3,0,C.black);box(coffee,.35,.15,.1,0,.36,.29,C.steel);cyl(coffee,.09,.14,0,.12,.24,C.white);sphere(coffee,.035,.17,.49,.26,glow('#a3f3b7'));
  cyl(g,.09,.45,3.65,.85,3.1,mat('#65529d'));label(g,'AURA',3.65,.88,3.21,.36);
  // Actual opening with Delft silhouettes beyond it.
  box(g,.22,2.3,3.1,-6.82,2.7,3.5,C.edge);box(g,.25,2.04,2.8,-6.68,2.7,3.5,mat('#6cacc1',.1,.25));for(const z of [2.13,3.5,4.87])box(g,.28,2.1,.06,-6.5,2.7,z,C.white);box(g,.28,.07,2.8,-6.5,2.7,3.5,C.white);
  for(let i=0;i<4;i++){box(g,.16,.4+i*.13,.38,-6.47,1.9+i*.07,2.5+i*.58,C.dark);cone(g,.27,.35,-6.47,2.2+i*.13,2.5+i*.58,C.red,4);}label(g,'DELFT / WINDOW',-5.9,3.95,3.5,1.8).rotation.y=Math.PI/2;
  plant(g,6.4,2.5);plant(g,-.2,3.8);
  // Small drum kit, hiking pack and game controllers represent hobbies.
  const drums=group(g,5.4,0,3.8);cyl(drums,.32,.25,0,.3,0,C.red).rotation.x=Math.PI/2;cyl(drums,.2,.15,-.4,.7,0,C.red);cyl(drums,.2,.15,.4,.7,0,C.red);cyl(drums,.32,.025,.55,.95,-.3,C.orange);interactive(drums,'Drumming and other things I enjoy','about');
  let last=0,index=0;return {group:g,title:'Home',subtitle:'Every door opens a different part of my world.',distance:19,target:new T.Vector3(0,1,0),actions:[{label:'Delft ↗',action:'room:delft'},{label:'Dungeon',action:'room:dungeon'},{label:'Health ↑',action:'room:health'},{label:'About me',action:'about'},{label:'Projects monitor',action:'project:0'}],tick(t){avatar.arms.forEach((a,i)=>a.rotation.x=-.9+Math.sin(t*2+i)*.04);if(t-last>7){last=t;index=(index+1)%shots.length;const m=screens[0].material as T.MeshBasicMaterial;m.map=screenshot(shots[index]);m.needsUpdate=true;screens[0].parent!.userData.action='project:'+([0,1,2,4,3][index]);}}};
 }
 function building(p:T.Object3D,x:number,z:number,w:number,h:number,color:T.Material,roof=true){const g=group(p,x,0,z);box(g,w,h,2.4,0,h/2,0,color);if(roof){const profile=new T.Shape();profile.moveTo(-w*.55,0);profile.lineTo(0,w*.65);profile.lineTo(w*.55,0);profile.closePath();const tiles=mat(Math.round(Math.abs(x*7+z*3))%3===0?'#4c5558':'#935b46');mesh(g,new T.ExtrudeGeometry(profile,{depth:2.55,bevelEnabled:false}),tiles,0,h,-1.275);box(g,.15,.4,.2,w*.3,h+w*.48,-.65,C.wood);} for(const xx of [-w*.26,w*.26])for(let y=.8;y<h-.1;y+=.85)box(g,.28,.4,.035,xx,y,1.22,glow('#e6c887',.35));box(g,.5,.8,.06,0,.4,1.24,C.dark);return g;}
 function makeDelft():World{
  const g=new T.Group();const ground=mat('#697d71');box(g,37,.3,35,2,-.22,1,ground);
  const roadMat=mat('#a49c8b'),water=mat('#458b99',.3,.3);
  const path=(points:number[][],width:number,m:T.Material,y=0)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);const segment=box(g,width,.035,l,(a[0]+b[0])/2,y,(a[1]+b[1])/2,m);segment.rotation.y=Math.atan2(dx,dz);}};
  path([[-5.6,-12],[-4.7,-5.5],[-4.1,-1],[-3,3],[-2.8,6],[1,15]],.48,water,-.025);
  path([[-3.7,-12],[-2.5,-5],[-1,-.5],[-.1,3],[1.3,5]],.38,water,-.025);
  path([[0,-13],[3,-8],[5,-2],[3.5,3],[1.3,5],[-2.8,6]],.65,water,-.02);
  // Public GPX route, projected in a local tangent plane (east +X, north -Z).
  path(routePoints,.48,roadMat,.015);
  const linePoints=routePoints.map(([x,z])=>new T.Vector3(x,.045,z));g.add(new T.Line(new T.BufferGeometry().setFromPoints(linePoints),new T.LineBasicMaterial({color:'#e4c480',transparent:true,opacity:.5})));
  const reserved=[[-2.75,-3.31],[-4.77,-3.89],[-6.07,5.05],[-4.84,8.31],[3.62,-.795],[4.1,.8],[11.23,12.02],[12.5,7],...routeStops.map(s=>[s.x,s.z])];
  const palettes=['#a97058','#bf9c78','#777f83','#8e6252','#be866c'].map(c=>mat(c));
  // Dense canal-side terraces, simplified footprints rather than satellite textures.
  for(let x=-8;x<4;x+=1.05)for(let z=-10;z<5;z+=1.25){if(reserved.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.4)||routePoints.some(p=>Math.hypot(p[0]-x,p[1]-z)<.5)||Math.abs(x-(-4.1-z*.1))<.45)continue;const i=Math.round((x+8)*7+(z+10)*3);const b=building(g,x,z,.75,.65+(Math.abs(i)%3)*.2,palettes[Math.abs(i)%5]);b.scale.z=.4;}
  const house=building(g,3.62,-.795,1.1,1.15,mat('#b87859'));house.scale.z=.5;interactive(house,'My house · enter','room:house');label(house,'HOME',0,1.7,1.3,1.5);house.userData.home=true;box(house,.32,.65,.07,0,.325,1.27,C.green);
  function church(x:number,z:number,old=false){const c=group(g,x,0,z);box(c,1.15,.95,2.15,0,.48,-.7,C.edge);const roof=cone(c,.9,.55,0,1.18,-.7,C.dark,4);roof.rotation.y=Math.PI/4;roof.scale.z=1.5;const tower=group(c,0,0,.4);if(old)tower.rotation.z=.045;box(tower,.6,old?2.5:3.2,.6,0,old?1.25:1.6,0,C.edge);for(let y=.5;y<(old?2.5:3.2);y+=.45)box(tower,.67,.06,.67,0,y,0,C.wood);cone(tower,.44,old?.7:1.05,0,old?2.83:3.7,0,C.dark,8);for(const x of [-.17,.17])box(tower,.1,.36,.02,x,old?2.1:2.7,.31,C.black);label(c,old?'OUDE KERK':'NIEUWE KERK',0,.7,1.05,1.7);}
  church(-2.75,-3.31);church(-4.77,-3.89,true);box(g,1.6,.03,1.4,-3.8,.035,-2.95,C.edge);
  const station=building(g,-6.07,5.05,2,.8,C.steel,false);station.scale.z=.5;label(station,'STATION DELFT',0,1.3,1.23,2);box(g,1.5,.06,5,-6.3,-.01,8.4,C.green);
  // Lumen is in De Hooghe Delft at Van Leeuwenhoekpark, south of the station.
  const lumen=group(g,-4.84,0,8.31);interactive(lumen,'Filmhuis Lumen · enter cinema','room:cinema');for(let n=0;n<7;n++){box(lumen,1.4-n*.05,.33,1.2,0,.3+n*.36,0,C.white);for(const x of [-.4,.4])box(lumen,.26,.19,.02,x,.3+n*.36,.615,C.dark);}box(lumen,1.7,.55,1.35,0,.27,0,C.steel);label(lumen,'LUMEN',0,.5,.72,1.35);
  routeStops.forEach(stop=>{const labelText=stop.name.replace('Delft Center','').replace('Camping ','');if(stop.name==='VVV'){label(g,'MARKT / VVV',stop.x,.4,stop.z,1.5);return;}const hotel=stop.name.includes('Hotel');const b=building(g,stop.x,stop.z,hotel?1.7:1.3,hotel?1.9:1,C.wall,false);b.scale.z=.55;label(b,labelText.toUpperCase(),0,hotel?2.35:1.45,1.3,hotel?2.5:2.2);if(hotel)for(let y=.4;y<1.8;y+=.35)for(const x of [-.55,0,.55])box(b,.19,.2,.03,x,y,1.23,C.edge);cyl(g,.08,.45,stop.x+.9,.23,stop.z+.8,C.blue);});
  const tu=group(g,11.23,0,12.02);box(tu,2.5,.65,2,0,.3,0,C.green);cone(tu,.55,1.7,0,1.25,0,C.steel,24);label(tu,'TU DELFT',0,1,1.2,2);
  const factory=group(g,12.5,0,7);interactive(factory,'DigiNova · enter factory','room:lab');box(factory,2.7,1.4,2,0,.7,0,C.steel);for(const x of [-.9,0,.9]){const r=cone(factory,.8,.5,x,1.6,0,C.dark,4);r.rotation.y=Math.PI/4;}box(factory,.8,1,.08,0,.5,1.04,C.dark);label(factory,'DIGINOVA',0,1.3,1.07,2.3);label(factory,'FACTORY',0,.7,1.1,1);path([[11.23,12.02],[12.5,12],[12.5,7],[6.35,4.65]],.42,roadMat,.02);
  // Oostpoort at the eastern canal crossing.
  const gate=group(g,4.1,0,.8);for(const x of [-.4,.4]){cyl(gate,.2,1,x,.5,0,C.wood);cone(gate,.3,.6,x,1.3,0,C.dark);}box(gate,.5,.25,.4,0,.85,0,C.wood);label(gate,'OOSTPOORT',0,.3,.5,1.6);
  // Urban greenery concentrates eastward toward Delftse Hout.
  for(let i=0;i<40;i++){const x=8+(i%8)*1.2,z=-14+Math.floor(i/8)*1.2;if(routePoints.some(p=>Math.hypot(p[0]-x,p[1]-z)<.7))continue;cyl(g,.025,.35,x,.17,z,C.wood,6);sphere(g,.23,x,.48,z,C.green,8);}
  label(g,'N ↑',-11,.3,-13,1);label(g,'DELFT',-9,.45,12,3);
  const tuks:T.Group[]=[];for(let i=0;i<3;i++){const tuk=group(g);interactive(tuk,'Delft City Shuttle · visit website','project:3');box(tuk,.45,.2,.8,0,.26,0,C.white);box(tuk,.5,.05,.9,0,.77,0,C.white);for(const x of [-.21,.21])for(const z of [-.35,.35])box(tuk,.025,.5,.025,x,.51,z,C.steel);box(tuk,.4,.26,.02,0,.57,.36,C.blue);for(const x of [-.23,.23]){const wheel=cyl(tuk,.11,.065,x,.12,-.25,C.dark);wheel.rotation.z=Math.PI/2;}const front=cyl(tuk,.11,.065,0,.12,.3,C.dark);front.rotation.z=Math.PI/2;tuks.push(tuk);}
  const path3=routePoints.map(p=>new T.Vector3(p[0],.05,p[1]));const lengths=[0];for(let i=1;i<path3.length;i++)lengths.push(lengths[i-1]+path3[i].distanceTo(path3[i-1]));const total=lengths[lengths.length-1];
  const walker=person(g,3.62,2.3,{hat:true});walker.group.scale.setScalar(.4);walker.group.visible=false;walker.group.userData.intro=true;
  return {group:g,title:'Delft',subtitle:'Follow the shuttle route through a simplified Delft.',distance:43,target:new T.Vector3(2,0,1),actions:[{label:'My house',action:'room:house'},{label:'DigiNova factory',action:'room:lab'},{label:'Filmhuis Lumen',action:'room:cinema'},{label:'Delft City Shuttle',action:'project:3'}],tick(t){tuks.forEach((tuk,i)=>{const d=(t*.85+i*total/3)%total;let idx=1;while(idx<lengths.length-1&&lengths[idx]<d)idx++;const a=path3[idx-1],b=path3[idx];const f=(d-lengths[idx-1])/Math.max(.001,lengths[idx]-lengths[idx-1]);tuk.position.lerpVectors(a,b,f);tuk.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);});if(walker.group.visible)walker.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*8+i*Math.PI)*.3);}};
 }
 function makeDungeon():World{
  const g=new T.Group();roomBase(g,14,11,mat('#48434f'));door(g,-5.3,-5.2,'Home','room:house','dungeon');label(g,'DUNGEON',0,4,-5.15,4);
  const table=group(g,0,0,.4);box(table,9,.3,6.4,0,1,0,C.wood);for(const x of [-3.8,3.8])for(const z of [-2.5,2.5])box(table,.25,1,.25,x,.5,z,C.dark);box(table,8.6,.08,6,0,1.2,0,mat('#655f60'));
  for(let x=-4;x<=4;x+=.6)box(table,.013,.012,6,x,1.25,0,C.dark);for(let z=-3;z<=3;z+=.6)box(table,8.6,.012,.013,0,1.25,z,C.dark);
  for(let i=0;i<14;i++){const x=-3.9+i*.6;for(let level=0;level<3;level++)box(table,.55,.25,.3,x,1.4+level*.26,-2.8,mat(level%2?'#85808a':'#78727c'));}
  for(const x of [-3.7,3.7]){cyl(table,.38,1.3,x,1.9,-2.5,C.wall,8);cone(table,.55,.7,x,2.9,-2.5,C.dark,8);}
  // A tabletop dragon: sculpted body, long neck, horned head, tail and wing membranes.
  const dragon=group(table,-.6,1.32,0);interactive(dragon,'Dragon miniature · Scenery en Zo','project:0');cyl(dragon,1.15,.08,0,0,0,C.dark,24);const scales=mat('#6d7a9b');const belly=sphere(dragon,.53,0,.6,0,scales);belly.scale.set(1.1,.8,1.7);
  rod(dragon,new T.Vector3(0,.7,.5),new T.Vector3(0,1.25,1.05),.18,scales);const head=sphere(dragon,.28,0,1.4,1.2,scales);head.scale.z=1.5;box(dragon,.3,.13,.45,0,1.32,1.5,scales);for(const x of [-.19,.19]){cone(dragon,.07,.35,x,1.7,1.12,C.edge);sphere(dragon,.04,x,1.46,1.39,glow('#f2bd57'));}
  for(const x of [-.38,.38])for(const z of [-.4,.4])rod(dragon,new T.Vector3(x,.5,z),new T.Vector3(x*1.5,.1,z+.15),.13,scales);
  const tail=new T.CatmullRomCurve3([new T.Vector3(0,.5,-.5),new T.Vector3(.4,.35,-1.1),new T.Vector3(.8,.2,-1.5),new T.Vector3(1.2,.3,-1.6)]);mesh(dragon,new T.TubeGeometry(tail,12,.1,6,false),scales);
  const wings:T.Group[]=[];for(const sign of [-1,1]){const wing=group(dragon,sign*.35,.8,-.1);const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(sign*1.3,1.1);shape.lineTo(sign*1.7,-.2);shape.lineTo(sign*.9,.05);shape.lineTo(sign*.6,-.5);shape.closePath();const m=new T.MeshStandardMaterial({color:'#846291',side:T.DoubleSide,roughness:.75});mesh(wing,new T.ShapeGeometry(shape),m);rod(wing,new T.Vector3(0,0,0),new T.Vector3(sign*1.3,1.1,0),.045,scales);wing.rotation.x=-.3;wings.push(wing);}
  // Skeleton party on round miniature bases.
  for(let i=0;i<5;i++){const sk=group(table,-3+i*1.4,1.31,1.8);interactive(sk,'Skeleton miniature · Scenery en Zo','project:0');cyl(sk,.29,.07,0,0,0,C.dark);sphere(sk,.12,0,.8,0,C.edge);for(const x of [-.045,.045])sphere(sk,.026,x,.82,.108,C.black,8);rod(sk,new T.Vector3(0,.2,0),new T.Vector3(0,.65,0),.032,C.edge);for(let y=.4;y<.65;y+=.08)box(sk,.22,.027,.08,0,y,0,C.edge);for(const sign of [-1,1]){rod(sk,new T.Vector3(0,.23,0),new T.Vector3(sign*.12,.05,.06),.027,C.edge);rod(sk,new T.Vector3(sign*.09,.6,0),new T.Vector3(sign*.24,.37,.05),.027,C.edge);}rod(sk,new T.Vector3(.24,.37,.05),new T.Vector3(.24,.95,.05),.022,C.steel);}
  for(const x of [-2.8,2.8]){const treasure=group(table,x,1.3,-1.5);interactive(treasure,'Treasure miniature · Scenery en Zo','project:0');box(treasure,.6,.35,.42,0,.18,0,C.wood);box(treasure,.1,.4,.45,0,.2,0,C.orange);}
  for(const x of [-6,6]){box(g,.12,1.2,.12,x,2,-4,C.dark);sphere(g,.15,x,2.7,-4,glow('#ffad51',2));}
  return {group:g,title:'The dungeon',subtitle:'A miniature world. Choose a dragon, skeleton, or treasure chest.',distance:18,target:new T.Vector3(0,1.3,0),actions:[{label:'Back through the door',action:'room:house'},{label:'Scenery en Zo',action:'project:0'}],tick(t){wings.forEach((w,i)=>w.rotation.y=Math.sin(t*.8)*.06*(i?1:-1));}};
 }
 function makeLab():World{
  const g=new T.Group();roomBase(g,16,12,mat('#40545d'));door(g,-6,-5.7,'Delft','room:delft','lab');label(g,'DIGINOVA / ROBOTICS',1,4,-5.7,6);
  const joints:T.Group[]=[];
  for(const [x,z]of [[-3,0],[2,-1],[5,2]]){const arm=group(g,x,0,z);interactive(arm,'DigiNova · robotics','project:2');cyl(arm,.6,.4,0,.2,0,C.dark);const shoulder=group(arm,0,.5,0);box(shoulder,.35,1.6,.4,0,.7,0,C.orange);const elbow=group(shoulder,0,1.5,0);elbow.rotation.z=-1;cyl(elbow,.25,.45,0,0,0,C.steel).rotation.x=Math.PI/2;box(elbow,.3,1.4,.3,0,.65,0,C.orange);const wrist=group(elbow,0,1.4,0);for(const x of [-.16,.16])box(wrist,.06,.3,.1,x,.1,0,C.steel);joints.push(shoulder,elbow);}
  const belt=group(g,0,0,2.2);box(belt,8,.25,1.2,0,.65,0,C.dark);for(let x=-3.8;x<4;x+=.3){const r=cyl(belt,.085,1.1,x,.8,0,C.steel,8);r.rotation.x=Math.PI/2;}for(const x of [-3.5,3.5])box(belt,.12,.6,1,x,.3,0,C.steel);
  const bots:T.Group[]=[];for(let i=0;i<3;i++){const bot=group(g,-2+i*2,0,2.2);interactive(bot,'Robot in construction · DigiNova','project:2');cyl(bot,.28,.2,0,1,0,C.white);cone(bot,.27,.65,0,1.4,0,C.white,16);const head=sphere(bot,.25,0,1.95,0,C.white);head.scale.x=1.15;for(const x of [-.09,.09])sphere(bot,.052,x,1.98,.22,C.black);box(bot,.22,.25,.035,0,1.6,.24,C.blue);bots.push(bot);}
  const cnc=group(g,4,0,-3.5);interactive(cnc,'CNC and robot systems · DigiNova','project:2');box(cnc,3,1.2,2,0,.6,0,C.steel);for(const x of [-1.3,1.3])box(cnc,.2,1.8,.3,x,1.9,0,C.white);box(cnc,2.8,.25,.35,0,2.7,0,C.white);const cutter=group(cnc,0,2.5,0);box(cutter,.5,.5,.5,0,-.3,0,C.dark);cone(cutter,.08,.3,0,-.7,0,C.steel);box(cnc,.7,.2,.7,0,1.3,0,C.orange);label(cnc,'CNC / 03',0,.75,1.05,1.7);
  const weld=group(g,-3,.9,-1);box(weld,1.8,.12,1.4,0,0,0,C.steel);const sparkMat=glow('#81d6ed',1.5);const sparks:T.Mesh[]=[];for(let i=0;i<12;i++)sparks.push(sphere(weld,.02,0,.2,0,sparkMat,6));
  const monitor=group(g,-2,0,-5.4);box(monitor,3.2,1.85,.15,0,2.3,0,C.dark);imageScreen(monitor,'diginova',3,1.69,0,2.3,.1);interactive(monitor,'DigiNova website','project:2');
  return {group:g,title:'DigiNova factory',subtitle:'A fictional factory near TU Delft. Meet the robots under construction.',distance:21,target:new T.Vector3(0,1,0),actions:[{label:'Exit to Delft',action:'room:delft'},{label:'DigiNova website',action:'project:2'}],tick(t){joints.forEach((j,i)=>j.rotation.z=(i%2?-1:-.4)+Math.sin(t*.65+i)*.25);cutter.position.x=Math.sin(t*.7)*.9;bots.forEach((b,i)=>b.position.x=((t*.25+i*2)%6)-3);sparks.forEach((s,i)=>{const phase=(t*.65+i/12)%1;s.position.set(Math.cos(i*2.4)*phase*.6,.2+Math.sin(phase*Math.PI)*.5,Math.sin(i*2.4)*phase*.5);s.visible=phase<.8;});}};
 }
 function makeHealth():World{
  const g=new T.Group();roomBase(g,14,11,mat('#987e80'));door(g,-5.5,-5.2,'Downstairs','room:house');label(g,'HEALTH / WIND DOWN',1,4,-5.2,5);
  const sizes=[{name:'Zero',w:.6,h:.8},{name:'Duplex',w:.65,h:1.45},{name:'Pentaplex',w:.9,h:2.1}];
  sizes.forEach((s,i)=>{const x=-2.8+i*2;const panel=group(g,x,0,-2.6);interactive(panel,'CytoLED '+s.name+' · website','project:1');box(panel,s.w+.12,s.h+.12,.18,0,s.h/2+.5,0,C.white);const leds=glow('#e95359',1.1);const rows=Math.round(s.h/.14);for(let r=0;r<rows;r++)for(let c=0;c<4;c++){const diode=cyl(panel,.035,.025,(c-1.5)*s.w/4,.57+r*.14,.11,leds,8);diode.rotation.x=Math.PI/2;}box(panel,s.w+.3,.08,.6,0,.08,0,C.steel);box(panel,.1,.4,.1,0,.3,0,C.steel);label(panel,s.name.toUpperCase(),0,s.h+.9,.1,1.15);const user=person(g,x,-.7,{bare:true});user.group.rotation.y=Math.PI;interactive(user.group,'Red-light panel session · CytoLED','project:1');});
  const bed=group(g,3.5,0,2.1);box(bed,2.1,.5,3.4,0,.3,0,C.wood);box(bed,2,.24,3.25,0,.68,0,C.white);box(bed,2.1,1.3,.18,0,.7,-1.7,C.wood);box(bed,1.6,.2,.6,0,.88,-1.05,C.edge);box(bed,2,.15,1.6,0,.85,.75,C.blue);
  const reader=person(bed,0,-.3,{glasses:true});reader.group.position.y=1;reader.group.rotation.x=-Math.PI/2;reader.group.scale.setScalar(.8);interactive(reader.group,'CytoSleep glasses · CytoLED','project:1');const book=group(bed,0,1.15,.1);box(book,.65,.04,.42,0,0,0,C.white);box(book,.025,.05,.42,0,.015,0,C.dark);book.rotation.x=-.35;interactive(book,'Reading before bed · CytoSleep glasses','project:1');
  box(g,.7,.65,.7,5.3,.35,.7,C.wood);cyl(g,.16,.22,5.3,.83,.7,glow('#b9663f',.25));plant(g,-5,3.6);
  return {group:g,title:'Upstairs · health',subtitle:'Panels in different sizes, a book, and a quiet evening.',distance:18,target:new T.Vector3(0,1,0),actions:[{label:'Downstairs to home',action:'room:house'},{label:'CytoLED panels & glasses',action:'project:1'}],tick(){}};
 }
 function makeCinema():World{
  const g=new T.Group();roomBase(g,15,13,mat('#2c303c'));door(g,-6.1,-6.1,'Delft','room:delft');label(g,'FILMHUIS LUMEN',0,4.2,-6.1,6);
  const screen=group(g,0,0,-5.75);interactive(screen,'Filmhuis Lumen · visit website','project:4');box(screen,8,4.3,.15,0,2.4,0,C.black);imageScreen(screen,'lumen',7.7,4.05,0,2.4,.1);
  for(let row=0;row<4;row++){box(g,12,.16*(row+1),1.6,0,.08*(row+1),-.8+row*1.7,C.dark);for(let col=0;col<7;col++){const seat=chair(g,(col-3)*1.25+(col>3?.5:0),-.8+row*1.7,C.red);seat.position.y=.16*(row+1);seat.rotation.y=0;}}
  for(const x of [-6.7,6.7])for(let z=-3;z<6;z+=1.3)box(g,.08,.06,.35,x,.25,z,glow('#cfb778',.8));
  return {group:g,title:'Filmhuis Lumen',subtitle:'Take a seat. The big screen opens the website.',distance:20,target:new T.Vector3(0,1,0),actions:[{label:'Exit to Delft',action:'room:delft'},{label:'Filmhuis Lumen website',action:'project:4'}],tick(){}};
 }
 const builders={house:makeHouse,delft:makeDelft,dungeon:makeDungeon,lab:makeLab,health:makeHealth,cinema:makeCinema};const cache=new Map<RoomId,World>();
 // Every clickable object gets a pulsing beacon floating above it, so what is
 // interactive reads as interactive without a hover state (touch has none) and
 // the beacon itself is an extra, larger tap target.
 const beaconTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const halo=ctx.createRadialGradient(64,64,0,64,64,64);halo.addColorStop(0,'#d9ffb0ff');halo.addColorStop(.4,'#c9fb9655');halo.addColorStop(1,'#c9fb9600');ctx.fillStyle=halo;ctx.fillRect(0,0,128,128);ctx.beginPath();ctx.arc(64,64,16,0,Math.PI*2);ctx.fillStyle='#f6ffe8';ctx.fill();ctx.beginPath();ctx.arc(64,64,30,0,Math.PI*2);ctx.strokeStyle='#e4ffbe';ctx.lineWidth=4;ctx.stroke();return finish(new T.CanvasTexture(c));})();
 function beacons(world:World){
  const size=world.distance*.03,box=new T.Box3(),top=new T.Vector3(),targets:T.Object3D[]=[];
  world.group.updateMatrixWorld(true);world.group.traverse(o=>{if(o.userData.action)targets.push(o);});
  const list=targets.map(o=>{box.setFromObject(o);box.getCenter(top);top.y=box.max.y+size*.6;const s=new T.Sprite(new T.SpriteMaterial({map:beaconTexture,transparent:true,depthWrite:false,toneMapped:false}));s.userData.marker=true;s.position.copy(o.worldToLocal(top));s.scale.setScalar(size);o.add(s);return s;});
  const tick=world.tick;world.tick=(t,dt)=>{tick(t,dt);const k=.5+.5*Math.sin(t*2.8);list.forEach(s=>{const hot=s.userData.hot;s.scale.setScalar(size*(hot?1.4:.85+.3*k));(s.material as T.SpriteMaterial).opacity=hot?1:.6+.4*k;});};
  return world;
 }
 return {get(id:RoomId){if(!cache.has(id))cache.set(id,beacons(builders[id]()));return cache.get(id)!;},dispose(){const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();cache.forEach(w=>w.group.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>ms.add(m));}}));gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
