import * as THREE from 'three';

export function mountLab(host: HTMLElement, onLost: () => void) {
 const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
 renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = 1.25;
 renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 const scene = new THREE.Scene();
 scene.background = new THREE.Color(0x09141b);
 scene.fog = new THREE.FogExp2(0x09141b, .027);
 const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
 const target = new THREE.Vector3(0, .5, 0);
 const desired = new THREE.Vector3(10, 9, 14);
 camera.position.copy(desired); camera.lookAt(target);
 scene.add(new THREE.HemisphereLight(0xc8e7ff, 0x292e24, 2.7));
 const key = new THREE.DirectionalLight(0xffeed9, 5); key.position.set(-3, 7, 4); scene.add(key); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;key.shadow.normalBias=.035;
 const rim = new THREE.DirectionalLight(0x8bdfff, 3); rim.position.set(2, 4, -4); scene.add(rim);
 const metal = new THREE.MeshStandardMaterial({color:0x54666e, metalness:.7, roughness:.32});
 const dark = new THREE.MeshStandardMaterial({color:0x18252c, metalness:.5, roughness:.45});
 const green = new THREE.MeshStandardMaterial({color:0x729459, roughness:.9});
 const stone = new THREE.MeshStandardMaterial({color:0xaab2a1, roughness:.9});
 const glow = new THREE.MeshStandardMaterial({color:0xffb16e, emissive:0xff713e, emissiveIntensity:2});
 const accent = new THREE.MeshStandardMaterial({color:0xbcf27c, emissive:0x8db553, emissiveIntensity:.6});
 const box = (parent: THREE.Object3D, size:number[], at:number[], material:THREE.Material) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size as [number,number,number]), material); mesh.position.set(...at as [number,number,number]); parent.add(mesh); return mesh; };
 box(scene,[7,.22,3.7],[0,-.35,0],dark);
 box(scene,[7,.04,.06],[0,-.2,1.8],metal);
 for(const x of [-3.2,3.2]) for(const z of [-1.5,1.5]) box(scene,[.13,.5,.13],[x,-.65,z],metal);
 const grid = new THREE.GridHelper(7,28,0x4a6169,0x283d46); grid.position.y=-.23; grid.scale.z=.52; scene.add(grid);
 const stations = [new THREE.Group(),new THREE.Group()];
 stations[0].position.x=-1.7; stations[1].position.x=1.7;
 stations.forEach((station,index)=> { scene.add(station); station.userData.station=index; box(station,[2.7,.22,2.6],[0,-.08,0],metal); box(station,[2.5,.05,2.4],[0,.05,0],dark); });
 const world=stations[0];
 box(world,[2.2,.14,1.9],[0,.17,0],green);
 for(const [x,z,r] of [[-.5,-.25,.42],[.6,.25,.3],[-.1,.5,.26]]) { const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),stone); rock.position.set(x,.28,z); rock.scale.y=.7; world.add(rock); }
 for(const [x,z,h] of [[-.75,.5,.6],[.6,-.5,.9],[.2,-.6,.65]]) { const tree=new THREE.Mesh(new THREE.ConeGeometry(.22,h,7),green); tree.position.set(x,.3+h/2,z);world.add(tree);box(world,[.045,.3,.045],[x,.35,z],metal); }
 const glass=new THREE.MeshStandardMaterial({color:0xb6e2e9,transparent:true,opacity:.09,roughness:.15,depthWrite:false,side:THREE.DoubleSide});
 const chamber=box(world,[2.4,1.65,2.12],[0,1,0],glass);
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(chamber.geometry),new THREE.LineBasicMaterial({color:0x8cadb7,transparent:true,opacity:.65}));edge.position.copy(chamber.position);world.add(edge);
 box(world,[2.5,.1,2.2],[0,1.88,0],metal);
 const scan=box(world,[2.13,.018,.035],[0,.7,0],accent);
 const device=stations[1];
 box(device,[.15,.9,.15],[0,.5,0],metal);
 const panel=new THREE.Group();panel.position.set(0,1.15,0);panel.rotation.x=-.12;device.add(panel);
 box(panel,[1.65,1.6,.3],[0,0,0],dark);
 for(const x of [-.83,.83]) box(panel,[.06,1.68,.35],[x,0,0],metal);
 for(let row=0;row<5;row++) for(let col=0;col<5;col++) { const led=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.035,12),glow);led.rotation.x=Math.PI/2;led.position.set((col-2)*.27,(row-2)*.27,.17);panel.add(led); }
 const light=new THREE.PointLight(0xff9a5a,3,4);light.position.set(1.7,1,1);scene.add(light);
 stations.map(station=>box(station,[.6,.025,.035],[0,.05,1.23],accent));

 // A room built from modular structural parts, rather than a floating exhibit.
 const floorMat=new THREE.MeshStandardMaterial({color:0x182b33,metalness:.55,roughness:.55});
 const orange=new THREE.MeshStandardMaterial({color:0xe4ab62,metalness:.55,roughness:.32});
 const rubber=new THREE.MeshStandardMaterial({color:0x142126,roughness:.9});
 const cyan=new THREE.MeshStandardMaterial({color:0xabe8e2,emissive:0x70c8cc,emissiveIntensity:2});
 box(scene,[22,.25,18],[0,-1.05,0],floorMat);
 for(let x=-10;x<=10;x+=2)box(scene,[.018,.012,18],[x,-.916,0],metal);
 for(let z=-8;z<=8;z+=2)box(scene,[22,.012,.018],[0,-.916,z],metal);
 box(scene,[22,6,.3],[0,2,-7],dark);
 box(scene,[.3,6,14],[-10,2,0],dark);
 for(let x=-9;x<11;x+=2){box(scene,[.08,5.6,.12],[x,1.9,-6.8],metal);box(scene,[1.7,.04,.04],[x+.9,3.8,-6.6],cyan);}
 for(const x of [-8,-4,0,4,8]){box(scene,[.11,.11,12],[x,4.5,-1],metal);box(scene,[2,.05,.3],[x,4.4,-3.5],cyan);}
 // Wall storage, ventilation, pipes and a terminal.
 for(let x=-8;x<-4;x+=1.2){box(scene,[1,2.6,.7],[x,.45,-6.3],floorMat);box(scene,[.07,.3,.08],[x+.3,.5,-5.9],orange);}
 for(let i=0;i<9;i++)box(scene,[2.5,.055,.08],[6,1.8+i*.12,-6.7],metal);
 for(const y of [.1,.4])box(scene,[18,.09,.09],[0,y,-6.6],metal);
 box(scene,[1.7,1,.9],[-5,-.3,-3.7],metal);const screen=box(scene,[1.5,.85,.12],[-5,.7,-3.7],dark);screen.rotation.x=-.25;
 for(let i=0;i<4;i++)box(scene,[1-i*.13,.025,.025],[-5,.85-i*.12,-3.61],cyan);
 // A long moving delivery line and payloads.
 const conveyor=new THREE.Group();conveyor.userData.station=3;scene.add(conveyor);conveyor.position.set(0,-.15,3.2);
 box(conveyor,[8.2,.25,1.3],[0,0,0],metal);box(conveyor,[8,.1,1.05],[0,.17,0],rubber);
 for(const z of [-.62,.62]){box(conveyor,[8.4,.13,.09],[0,.25,z],orange);for(const x of [-3.7,3.7])box(conveyor,[.13,.7,.13],[x,-.43,z],metal);}
 const rollers:THREE.Mesh[]=[];
 for(let x=-3.9;x<=4;x+=.3){const roller=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.05,10),metal);roller.rotation.x=Math.PI/2;roller.position.set(x,.17,0);conveyor.add(roller);rollers.push(roller);}
 const cargo:THREE.Group[]=[];
 for(let i=0;i<4;i++){const pallet=new THREE.Group();pallet.position.set(i*2-3,.35,0);conveyor.add(pallet);box(pallet,[.8,.1,.8],[0,0,0],dark);const item=new THREE.Mesh(new THREE.DodecahedronGeometry(.23),i%2?orange:green);item.position.y=.24;pallet.add(item);cargo.push(pallet);}
 // Articulated shoulder, elbow, wrist and gripper.
 const robot=new THREE.Group();robot.userData.station=2;robot.position.set(-4.7,-.8,1.5);scene.add(robot);
 const cylinder=(parent:THREE.Object3D,r:number,h:number,at:number[],mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);m.position.set(...at as [number,number,number]);parent.add(m);return m;};
 cylinder(robot,.6,.35,[0,.12,0],dark);cylinder(robot,.38,.3,[0,.42,0],metal);
 const shoulder=new THREE.Group();shoulder.position.y=.65;robot.add(shoulder);shoulder.rotation.z=-.5;
 box(shoulder,[.38,1.65,.4],[0,.7,0],orange);const joint=cylinder(shoulder,.28,.5,[0,1.5,0],metal);joint.rotation.x=Math.PI/2;
 const elbow=new THREE.Group();elbow.position.y=1.5;elbow.rotation.z=-1.1;shoulder.add(elbow);
 box(elbow,[.3,1.4,.32],[0,.65,0],orange);box(elbow,[.08,1.1,.06],[.23,.65,0],dark);
 const wrist=new THREE.Group();wrist.position.y=1.4;elbow.add(wrist);cylinder(wrist,.23,.25,[0,0,0],metal);
 const fingers=[box(wrist,[.09,.45,.1],[-.2,.3,0],metal),box(wrist,[.09,.45,.1],[.2,.3,0],metal)];
 // Second, smaller service arm balances the workshop.
 const robot2=robot.clone(true);robot2.position.set(4.5,-.8,-2);robot2.rotation.y=Math.PI;robot2.scale.setScalar(.75);scene.add(robot2);

 const tv=new THREE.Group();tv.position.set(4.5,0,-4.2);tv.rotation.y=-.2;tv.userData.station=4;scene.add(tv);
 box(tv,[2,.16,1],[0,-.72,0],metal);box(tv,[.14,1.3,.14],[0,-.05,0],metal);
 box(tv,[3.4,2,.24],[0,1.35,0],dark);box(tv,[3.2,1.8,.025],[0,1.35,.135],cyan);
 const screenTextures:THREE.Texture[]=[];
 const loadScreen=(group:THREE.Group,name:string,w:number,h:number,position:number[])=>{
  const material=new THREE.MeshBasicMaterial({color:0xffffff});const display=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);display.position.set(...position as [number,number,number]);group.add(display);
  new THREE.TextureLoader().load(import.meta.env.BASE_URL+'images/'+name+'.webp',texture=>{if(dead){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;material.map=texture;material.needsUpdate=true;screenTextures.push(texture);sync();},undefined,()=>{material.color.setHex(0x9bccb8);sync();});
 };
 loadScreen(tv,'lumen',3.16,1.78,[0,1.35,.155]);
 const storefront=new THREE.Group();storefront.position.set(-2,0,-2.2);storefront.userData.station=0;scene.add(storefront);
 box(storefront,[2.5,1.55,.15],[0,1.15,0],dark);box(storefront,[.12,.7,.12],[0,.1,0],metal);loadScreen(storefront,'scenery-en-zo',2.35,1.32,[0,1.15,.09]);
 const interactives=[...stations,robot,robot2,conveyor,tv,storefront];
 const outline=new THREE.Box3Helper(new THREE.Box3(),0xd0fa94);outline.visible=false;scene.add(outline);
 let direction=1,cycle=0;

 scene.traverse(o=>{if(o instanceof THREE.Mesh && o.material!==glass){o.castShadow=true;o.receiveShadow=true;}});
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=motion.matches,dead=false,frame=0,last=0,elapsed=0,hovered=-1;
 let yaw=.62,pitch=.57,distance=18;
 const orbit=()=>{desired.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);};
 const render=()=>renderer.render(scene,camera);
 const tick=(time:number)=>{if(dead||document.hidden){frame=0;return;}const dt=Math.min((time-(last||time))/1000,.05);last=time;
  if(!paused){elapsed+=dt;scan.position.y=.45+(Math.sin(elapsed*.7)+1)*.48;glow.emissiveIntensity=1.8+Math.sin(elapsed*.55)*.15;cargo.forEach(p=>{p.position.x=THREE.MathUtils.euclideanModulo(p.position.x+dt*.45*direction+4,8)-4;});rollers.forEach(r=>r.rotation.y+=dt*direction);shoulder.rotation.z=-.5+Math.sin(elapsed*.45)*.15;elbow.rotation.z=-1.1+Math.sin(elapsed*.45+.8)*.28;wrist.rotation.y=Math.sin(elapsed*.8)*.3;robot2.rotation.y=Math.PI+Math.sin(elapsed*.3)*.2;fingers.forEach((f,i)=>f.position.x=(i?1:-1)*(.16+Math.sin(elapsed*1.2)*.045));}
  if(cycle>0){cycle=Math.max(0,cycle-dt);shoulder.rotation.z=-.5+Math.sin(cycle*2)*.35;elbow.rotation.z=-1.1+Math.cos(cycle*2)*.45;}
  camera.position.lerp(desired,motion.matches?1:1-Math.exp(-dt*5));camera.lookAt(target);render();
  if(!paused||cycle>0||camera.position.distanceTo(desired)>.005)frame=requestAnimationFrame(tick);else frame=0;
 };
 const sync=()=>{if(!dead&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick);}};
 const select=(index:number)=>{const positions=[[-1.7,.6,0],[1.7,.6,0],[-4,.5,1.5],[0,.2,3.2],[4.5,1,-4.2]];target.set(...positions[index] as [number,number,number]);distance=innerWidth<700?12:8;orbit();sync();};
 const overview=()=>{target.set(0,.2,0);yaw=.62;pitch=.57;distance=innerWidth<700?24:18;orbit();sync();};
 const activate=(index:number)=>{if(index===2){cycle=motion.matches?0:6;if(motion.matches){shoulder.rotation.z=-.9;elbow.rotation.z=-.6;}}if(index===3)direction*=-1;sync();};
 const controls={get paused(){return paused;},toggle(){paused=!paused;sync();},select,overview,activate,onSelect:(_index:number)=>{},onHover:(_index:number,_x:number,_y:number)=>{},onChange:()=>{}};
 const resize=new ResizeObserver(()=>{if(dead)return;const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();sync();});
 const raycaster=new THREE.Raycaster();
 const hit=(event:PointerEvent)=>{const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);const found=raycaster.intersectObjects(interactives,true)[0];let object:THREE.Object3D|null=found?.object||null;while(object&&object.userData.station===undefined)object=object.parent;return object;};
 let down: {x:number,y:number,lastX:number,lastY:number,moved:boolean}|null=null;
 const pointerdown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId);};
 const pointermove=(e:PointerEvent)=>{if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;if(down.moved){yaw-=(e.clientX-down.lastX)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-down.lastY)*.005,.15,1.25);orbit();sync();}down.lastX=e.clientX;down.lastY=e.clientY;return;}const object=hit(e);hovered=object?.userData.station??-1;outline.visible=!!object;if(object)outline.box.setFromObject(object);renderer.domElement.style.cursor=object?'pointer':'grab';controls.onHover(hovered,e.clientX,e.clientY);sync();};
 const pointerup=(e:PointerEvent)=>{if(down&&!down.moved){const object=hit(e);if(object)controls.onSelect(object.userData.station);}down=null;};
 const leave=()=>{outline.visible=false;controls.onHover(-1,0,0);sync();};
 const wheel=(e:WheelEvent)=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.012,5,30);orbit();sync();};
 renderer.domElement.addEventListener('pointerdown',pointerdown);renderer.domElement.addEventListener('pointermove',pointermove);renderer.domElement.addEventListener('pointerup',pointerup);renderer.domElement.addEventListener('pointercancel',()=>down=null);renderer.domElement.addEventListener('pointerleave',leave);renderer.domElement.addEventListener('wheel',wheel,{passive:false});
 const changed=()=>{paused=motion.matches;controls.onChange();sync();};
 const cleanup=()=>{if(dead)return;dead=true;cancelAnimationFrame(frame);resize.disconnect();motion.removeEventListener('change',changed);document.removeEventListener('visibilitychange',sync);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.LineSegments){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());screenTextures.forEach(t=>t.dispose());renderer.dispose();};
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();onLost();});window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup();});document.addEventListener('visibilitychange',sync);motion.addEventListener('change',changed);
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);resize.observe(host);overview();camera.position.copy(desired);camera.lookAt(target);return controls;
}
