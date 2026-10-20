import * as T from 'three';
import {HORSE_TARGET,PEP_Y,PEP_LANES,surfaceKind,flipperSettings,type SurfaceKind,type SpeedMode} from './pinball-modes.js';

export type TableState={flashes:Record<string,number>;mode:SpeedMode;balls:{x:number;y:number;height?:number}[];remaining:number;score:number;targets:boolean[];letters:number;bonus:number};
type Rail={x1:number;y1:number;x2:number;y2:number};
export const rampPoints=[[83,430,8],[72,365,28],[86,305,55],[135,280,65],[170,312,60],[157,360,35],[124,405,8]];
const rampCurve=new T.CatmullRomCurve3(rampPoints.map(([x,y,h])=>new T.Vector3(x,h,y)));
export function rampPosition(t:number):{x:number;y:number;height:number}{
  const p=rampCurve.getPoint(Math.max(0,Math.min(t,1)));return{x:p.x,y:p.z,height:p.y};
}

export function createPinballScene(canvas:HTMLCanvasElement,rails:Rail[]){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(600,840,false);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const scene=new T.Scene();scene.background=new T.Color('#000000');
  const camera=new T.PerspectiveCamera(32,1,1,2500);
  const direction=new T.Vector3(0,1060,650).normalize();
  const corners:T.Vector3[]=[];
  for(const x of [-253,253])for(const y of [-20,72])for(const z of [-374,374])corners.push(new T.Vector3(x,y,z));
  let viewportWidth=0,viewportHeight=0;
  const resize=()=>{
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height||(width===viewportWidth&&height===viewportHeight))return;
    viewportWidth=width;viewportHeight=height;renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const bounds=(distance:number)=>{
      camera.position.copy(direction).multiplyScalar(distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
      const points=corners.map(p=>p.clone().project(camera));
      return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),bottom:Math.min(...points.map(p=>p.y)),top:Math.max(...points.map(p=>p.y))};
    };
    // Fit projected cabinet extents, then centre them optically instead of the world origin.
    let near=600,far=2400;
    for(let i=0;i<24;i++){const mid=(near+far)/2,b=bounds(mid);if(b.right-b.left>1.94||b.top-b.bottom>1.94)near=mid;else far=mid;}
    const b=bounds(far);
    camera.projectionMatrix.elements[8]+=(b.left+b.right)/2;
    camera.projectionMatrix.elements[9]+=(b.bottom+b.top)/2;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  };
  scene.add(new T.HemisphereLight(0xc4d5f2,0x12101d,.85));
  const light=new T.DirectionalLight(0xffe0ad,2.5);light.position.set(-250,650,100);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-330,right:330,top:450,bottom:-450,near:1,far:1500});light.shadow.bias=-.001;scene.add(light);
  const fill=new T.DirectionalLight(0x80baff,.8);fill.position.set(320,200,-300);scene.add(fill);
  const metal=new T.MeshStandardMaterial({color:0xcbd3df,metalness:.78,roughness:.22});
  const blue=new T.MeshStandardMaterial({color:0x202044,metalness:.35,roughness:.3});
  const plastic=new T.MeshStandardMaterial({color:0x55358a,metalness:.25,roughness:.27});
  const red=new T.MeshStandardMaterial({color:0xb62031,metalness:.3,roughness:.26});
  const rubber=new T.MeshStandardMaterial({color:0xf4dfb7,roughness:.6});
  const dark=new T.MeshStandardMaterial({color:0x172033,metalness:.5,roughness:.35});
  const white=new T.MeshStandardMaterial({color:0xeaf0f8,metalness:.2,roughness:.25});
  const amber=new T.MeshStandardMaterial({color:0xffac32,emissive:0xff6510,emissiveIntensity:.6});
  const pos=(x:number,y:number,h=0)=>new T.Vector3(x-240,h,y-360);
  const mesh=(g:T.BufferGeometry,m:T.Material,x:number,y:number,h:number,parent:T.Object3D=scene)=>{const o=new T.Mesh(g,m);o.position.copy(pos(x,y,h));o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
  const box=(x:number,y:number,w:number,d:number,h:number,m:T.Material,elevation=h/2)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,elevation);
  const cylinder=(x:number,y:number,r:number,h:number,m:T.Material,elevation=h/2)=>mesh(new T.CylinderGeometry(r,r,h,32),m,x,y,elevation);
  const tube=(points:number[][],radius:number,m:T.Material)=>{const curve=new T.CatmullRomCurve3(points.map(p=>pos(p[0],p[1],p[2])));return mesh(new T.TubeGeometry(curve,Math.max(12,points.length*10),radius,8,false),m,240,360,0);};
  const segment=(a:number[],b:number[],radius:number,m:T.Material)=>{const va=pos(a[0],a[1],a[2]),vb=pos(b[0],b[1],b[2]),d=vb.clone().sub(va);const o=new T.Mesh(new T.CylinderGeometry(radius,radius,d.length(),10),m);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());o.castShadow=true;scene.add(o);return o;};
  // Printed playfield: lacquered blue machinery, canal map and illuminated inserts.
  const art=document.createElement('canvas');art.width=960;art.height=1440;const c=art.getContext('2d')!;c.scale(2,2);
  c.fillStyle='#163a8a';c.fillRect(0,0,480,720);
  const wash=c.createRadialGradient(240,300,10,240,330,440);wash.addColorStop(0,'#2765bb');wash.addColorStop(1,'#061847');c.fillStyle=wash;c.fillRect(0,0,480,720);
  c.strokeStyle='#224d80';c.lineWidth=1;for(let i=0;i<12;i++){c.beginPath();c.ellipse(240,285,60+i*16,110+i*18,-.28,0,Math.PI*2);c.stroke();}
  c.strokeStyle='#c6b888';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(40+i*45,30);c.lineTo(55+i*40,250);c.lineTo(30+i*45,480);c.stroke();}
  c.fillStyle='#0b2452';c.fillRect(140,350,200,100);c.strokeStyle='#d9af54';c.strokeRect(143,353,194,94);
  const text=(s:string,x:number,y:number,size:number,color='#eadca0')=>{c.font=`bold ${size}px Georgia`;c.fillStyle=color;c.textAlign='center';c.fillText(s,x,y);};
  text('CANAL',240,385,34);text('CADET',240,421,34);text('AMSTERDAM • AFTER DARK',240,442,9);
  text('NIGHT RIDER',240,80,17);text('BORREL',240,306,13);text('CLUB RAMP',83,453,9);text('LAST TRAM',240,691,13);
  // Machine artwork: bikes, canal rings and hazard stripes around the drain.
  c.strokeStyle='#e1bd63';c.lineWidth=3;for(const x of [206,274]){c.beginPath();c.arc(x,490,20,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(206,490);c.lineTo(228,455);c.lineTo(250,490);c.lineTo(206,490);c.moveTo(228,455);c.lineTo(265,455);c.lineTo(250,490);c.moveTo(265,455);c.lineTo(274,490);c.stroke();
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#e5b84d':'#182746';c.fillRect(158+i*27,706,27,10);}
  // Printed machinery and route arrows make the playfield read like a 90s table.
  for(const x of [110,370]){for(let y=350;y<510;y+=32){c.fillStyle='#a66928';c.beginPath();c.moveTo(x,y-10);c.lineTo(x-7,y+5);c.lineTo(x+7,y+5);c.closePath();c.fill();}}
  c.strokeStyle='#9d8450';c.lineWidth=2;for(const x of [154,326]){c.beginPath();c.moveTo(x,420);c.lineTo(x,530);c.lineTo(240,565);c.stroke();}
  text('MULTIBALL',240,345,8);text('RAVE',240,535,11);text('SHOOT THE RAMP',240,553,8);
  for(let i=0;i<6;i++){const x=190+i*20;c.fillStyle='#08132c';c.fillRect(x-7,573,14,17);text('TECHNO'[i],x,585,10,'#d69d40');}
  const texture=new T.CanvasTexture(art);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const board=mesh(new T.PlaneGeometry(480,720),new T.MeshStandardMaterial({map:texture,roughness:.38,metalness:.15}),240,360,0);board.rotation.x=-Math.PI/2;
  let disposed=false;
  const printedArt=new T.TextureLoader().load('/assets/pinball/playfield.png',loaded=>{if(disposed){loaded.dispose();return;}loaded.colorSpace=T.SRGBColorSpace;loaded.anisotropy=renderer.capabilities.getMaxAnisotropy();(board.material as T.MeshStandardMaterial).map=loaded;(board.material as T.MeshStandardMaterial).needsUpdate=true;canvas.dataset.artReady="true";});
  const floor=mesh(new T.PlaneGeometry(1800,1800),new T.MeshBasicMaterial({color:0x000000}),240,360,-20);floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.receiveShadow=false;
  box(240,360,500,740,16,dark,-10);box(0,360,14,740,42,blue,6);box(480,360,14,740,42,blue,6);box(240,0,480,14,65,blue,22);
  box(240,724,495,20,28,metal,0);
  const clubMarkers:T.Mesh[]=[];
  const clubMaterial=(kind:SurfaceKind)=>new T.MeshBasicMaterial({color:kind==='pep'?0xffd544:0xb36dff});
  for(const [i,r] of rails.entries()){
    const glow=segment([r.x1,r.y1,18],[r.x2,r.y2,18],2,clubMaterial(surfaceKind(i)));clubMarkers.push(glow);
segment([r.x1,r.y1,9],[r.x2,r.y2,9],5,red);segment([r.x1,r.y1,15],[r.x2,r.y2,15],2,metal);for(const t of [0,.5,1])cylinder(r.x1+(r.x2-r.x1)*t,r.y1+(r.y2-r.y1)*t,3,13,metal);}
  // Back-bank lane guides and lamp inserts.
  for(const x of [172,215,258,301]){tube([[x,78,16],[x,105,16],[x+8,120,16]],3,metal);cylinder(x+17,98,6,2,amber,2);}
  const inserts=[0,1,2,3,4,5].map(i=>cylinder(190+i*20,565,5,1,new T.MeshStandardMaterial({color:0xf1a027,emissive:0xff7900,emissiveIntensity:.05}),1));
  for(const x of [110,370])for(let y=345;y<490;y+=30)cylinder(x,y,4,1,amber,1);
  const bumpers=[{x:150,y:220},{x:330,y:220},{x:240,y:145},{x:82,y:80}].map(p=>{
    cylinder(p.x,p.y,27,7,metal);cylinder(p.x,p.y,23,13,red,13);cylinder(p.x,p.y,29,5,rubber,17);
    const cap=cylinder(p.x,p.y,26,6,rubber.clone(),27);
    cylinder(p.x,p.y,5,1,red,31);
    for(let petal=0;petal<10;petal++){const a=petal*Math.PI/5;const flower=cylinder(p.x+Math.cos(a)*15,p.y+Math.sin(a)*15,4,1,red,31);flower.scale.set(1.5,1,.65);flower.rotation.y=-a;}
    for(let lamp=0;lamp<8;lamp++){const a=lamp*Math.PI/4;cylinder(p.x+Math.cos(a)*24,p.y+Math.sin(a)*24,2,10,amber,11);}
    return cap;
  });
  cylinder(HORSE_TARGET.x,HORSE_TARGET.y,HORSE_TARGET.radius,9,dark);
  const horseshoe=mesh(new T.TorusGeometry(12,3,8,28,Math.PI*1.65),metal,HORSE_TARGET.x,HORSE_TARGET.y,14);horseshoe.rotation.x=-Math.PI/2;
  const pepLamps=PEP_LANES.map(x=>cylinder(x,PEP_Y,6,2,new T.MeshStandardMaterial({color:0xeace26,emissive:0xeace26,emissiveIntensity:.1}),2));
  const targets=[0,1,2].map(i=>{box(185+i*55,333,34,12,6,metal);return box(185+i*55,330,27,7,27,red.clone(),18);});
  for(const target of targets)for(const row of [-7,0,7])for(const angle of [-Math.PI/4,Math.PI/4]){
    const cross=new T.Mesh(new T.BoxGeometry(7,1.7,1),rubber);cross.position.set(0,row,4);cross.rotation.z=angle;target.add(cross);
  }
  for(const [x,y,kind] of [[150,220,'pep'],[330,220,'keta'],[240,145,'pep'],[82,80,'keta'],[185,330,'pep'],[240,330,'keta'],[295,330,'pep'],[395,285,'pep'],[HORSE_TARGET.x,HORSE_TARGET.y,'keta']] as [number,number,SurfaceKind][]){
    const marker=mesh(new T.TorusGeometry(12,2,6,20),clubMaterial(kind),x,y,40);marker.rotation.x=-Math.PI/2;clubMarkers.push(marker);
  }
  // Raised wireform ramp, with a real return path used by the ball simulation.
  // Sculpted bridge deck: solid purple plastic, elevated over the printed canal.
  const deckVertices:number[]=[],deckIndices:number[]=[];
  for(let i=0;i<=80;i++){const p=rampPosition(i/80);for(const offset of [-19,19])deckVertices.push(p.x+offset-240,p.height-6,p.y-360);if(i<80){const a=i*2;deckIndices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const deckGeometry=new T.BufferGeometry();deckGeometry.setAttribute('position',new T.Float32BufferAttribute(deckVertices,3));deckGeometry.setIndex(deckIndices);deckGeometry.computeVertexNormals();
  const deck=new T.Mesh(deckGeometry,new T.MeshStandardMaterial({color:0x70508c,metalness:.08,roughness:.75,side:T.DoubleSide}));deck.castShadow=true;deck.receiveShadow=true;scene.add(deck);
  for(const offset of [-19,19]){tube(rampPoints.map(([x,y,h])=>[x+offset,y,h+5]),3,metal);tube(rampPoints.map(([x,y,h])=>[x+offset,y,h-2]),5,plastic);}
  for(const t of [.14,.35,.56,.78]){const p=rampPosition(t);cylinder(p.x-20,p.y,3,p.height+15,metal);cylinder(p.x-20,p.y,4,8,amber,p.height+19);}
  for(let t=0;t<=1;t+=.08){const p=rampPosition(t);segment([p.x-14,p.y,p.height-3],[p.x+14,p.y,p.height-3],1.5,metal);}
  for(const i of [1,2,3,4,5]){const [x,y,h]=rampPoints[i];cylinder(x-14,y,3,h,metal);cylinder(x+14,y,3,h,metal);}
  // Masonry parapets follow the same physical ramp curve; no new colliders.
  const brickCanvas=document.createElement('canvas');brickCanvas.width=128;brickCanvas.height=128;
  const brickInk=brickCanvas.getContext('2d')!;brickInk.fillStyle='#3a3045';brickInk.fillRect(0,0,128,128);
  for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
    brickInk.fillStyle=['#796485','#70577e','#856b90','#655071'][(row*3+col+8)%4];
    brickInk.fillRect(col*32+(row%2)*16+1,row*16+1,30,14);
    brickInk.fillStyle='#b39cbc55';brickInk.fillRect(col*32+(row%2)*16+2,row*16+2,28,1);
  }
  const masonryTexture=new T.CanvasTexture(brickCanvas);masonryTexture.colorSpace=T.SRGBColorSpace;masonryTexture.wrapS=masonryTexture.wrapT=T.RepeatWrapping;masonryTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const stone=new T.MeshStandardMaterial({color:0xd8bce8,map:masonryTexture,roughness:.9});
  const deckUV:number[]=[];for(let i=0;i<=80;i++)deckUV.push(0,i/16,1,i/16);
  deckGeometry.setAttribute('uv',new T.Float32BufferAttribute(deckUV,2));
  (deck.material as T.MeshStandardMaterial).map=masonryTexture;(deck.material as T.MeshStandardMaterial).color.setHex(0xb49ac7);

  const mortar=new T.MeshStandardMaterial({color:0x493959,roughness:1});
  for(let i=1;i<28;i++){
    const t=i/29,p=rampPosition(t),next=rampPosition(Math.min(1,t+.01));
    const angle=Math.atan2(next.x-p.x,next.y-p.y);
    for(const side of [-1,1]){
      const x=p.x+side*20;
      const wall=box(x,p.y,5,9,14,mortar,p.height+1);wall.rotation.y=angle;
      for(const row of [0,1]){const brick=box(x,p.y+(row?2:0),5.5,7,5,stone,p.height-3+row*6);brick.rotation.y=angle;}
      if(i%5===0){cylinder(x,p.y,2,23,dark,p.height+14);cylinder(x,p.y,3,6,amber,p.height+27);const hat=mesh(new T.ConeGeometry(5,4,4),dark,x,p.y,p.height+32);hat.rotation.y=Math.PI/4;}
    }
  }
  // Arched masonry skirts leave open tunnels beneath the actual ramp deck.
  for(const side of [-1,1]){
    const vertices:number[]=[],indices:number[]=[],uv:number[]=[];
    for(let i=0;i<=96;i++){
      const t=i/96,p=rampPosition(t);
      const arch=Math.pow(Math.max(0,Math.sin(t*Math.PI*4)),.55);
      const underside=Math.max(2,(p.height-10)*arch);
      vertices.push(p.x+side*19-240,underside,p.y-360,p.x+side*19-240,p.height-5,p.y-360);
      uv.push(t*5,underside/64,t*5,(p.height-5)/64);
      if(i<96){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
    const wall=new T.Mesh(geometry,new T.MeshStandardMaterial({color:0xc2a4d0,map:masonryTexture,roughness:.85,side:T.DoubleSide}));wall.castShadow=true;wall.receiveShadow=true;scene.add(wall);
    for(let i=0;i<=48;i++){
      const t=i/48,p=rampPosition(t),arch=Math.pow(Math.max(0,Math.sin(t*Math.PI*4)),.55),bottom=Math.max(2,(p.height-10)*arch);
      if(p.height-bottom>8)segment([p.x+side*19.5,p.y,bottom],[p.x+side*19.5,p.y,p.height-6],.45,mortar);
    }
  }
  // Warm street lamps articulate the canal edges, clear of the playing lane.
  for(const [x,y] of [[30,170],[430,160],[35,445],[420,420],[65,605],[405,605]]){
    cylinder(x,y,4,3,metal);cylinder(x,y,1.6,30,dark,18);cylinder(x,y,3.5,7,amber,36);
    mesh(new T.ConeGeometry(5,5,4),dark,x,y,42);
  }
  // Slingshot assemblies, rubber faces, bolts and translucent-looking blue caps.
  for(const mirror of [false,true]){const pts=[[70,470],[144,540],[120,575]].map(([x,y])=>[mirror?480-x:x,y]);const shape=new T.Shape();shape.moveTo(pts[0][0]-240,-(pts[0][1]-360));for(const p of pts.slice(1))shape.lineTo(p[0]-240,-(p[1]-360));shape.closePath();const o=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:16,bevelEnabled:true,bevelSize:3,bevelThickness:2,bevelSegments:2}),plastic);o.rotation.x=-Math.PI/2;o.position.y=4;o.castShadow=true;scene.add(o);for(let i=0;i<3;i++){const a=pts[i],b=pts[(i+1)%3];segment([a[0],a[1],10],[b[0],b[1],10],3,rubber);cylinder(a[0],a[1],5,24,metal);}}
  const flippers=[170,310].map(x=>{const group=new T.Group();group.position.copy(pos(x,640,12));scene.add(group);const shape=new T.Shape();shape.absarc(0,0,10,Math.PI/2,Math.PI*1.5,false);shape.lineTo(60,-6);shape.absarc(60,0,6,-Math.PI/2,Math.PI/2,false);shape.lineTo(0,10);const body=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:10,bevelEnabled:true,bevelSize:1,bevelThickness:1,bevelSegments:2}),rubber);body.rotation.x=-Math.PI/2;group.add(body);const stripe=new T.Mesh(new T.BoxGeometry(47,2,7),red.clone());stripe.position.set(25,12,0);group.add(stripe);const pivot=new T.Mesh(new T.CylinderGeometry(5,5,13,20),metal);pivot.position.y=8;group.add(pivot);group.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=true;});return group;});
  // Lower dance-floor inserts and brass kickout ring.
  const danceLamps:T.Mesh[]=[];
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2;danceLamps.push(cylinder(240+Math.cos(a)*57,475+Math.sin(a)*57,5,1,new T.MeshStandardMaterial({color:0x4cdbea,emissive:0x29b6d3,emissiveIntensity:.7}),1));}
  // Stepped canal gables, recessed doors and warm cross-bar windows.
  for(let i=0;i<6;i++){
    const x=105+i*48,h=36+(i%3)*5;
    const facade=new T.Shape();facade.moveTo(-17,0);facade.lineTo(17,0);facade.lineTo(17,h);facade.lineTo(11,h);facade.lineTo(11,h+7);facade.lineTo(5,h+7);facade.lineTo(5,h+14);facade.lineTo(-5,h+14);facade.lineTo(-5,h+7);facade.lineTo(-11,h+7);facade.lineTo(-11,h);facade.lineTo(-17,h);facade.closePath();
    const brick=new T.MeshStandardMaterial({color:[0x53312c,0x47445a,0x734b32][i%3],roughness:.9});
    mesh(new T.ExtrudeGeometry(facade,{depth:18,bevelEnabled:false}),brick,x,21,3);
    box(x,40,7,1,13,dark,10);
    for(const dx of [-10,10])for(const y of [22,35]){
      box(x+dx,40,7,2,9,metal,y);box(x+dx,41.2,5,1,7,amber,y);
      box(x+dx,42,1,1,7,dark,y);box(x+dx,42,5,1,1,dark,y);
    }
    box(x,41,5,1,5,amber,h+7);
  }
  const windmill=new T.Group();windmill.position.copy(pos(395,285,25));scene.add(windmill);cylinder(395,285,12,26,blue);for(const angle of [0,Math.PI/2]){const blade=new T.Mesh(new T.BoxGeometry(43,4,6),metal);blade.rotation.y=angle;windmill.add(blade);}
  tube([[454,680,10],[454,690,10]],7,metal);for(let y=680;y<710;y+=4){const ring=mesh(new T.TorusGeometry(7,1,6,16),metal,454,y,9);ring.rotation.x=Math.PI/2;}
  const balls=[0,1,2].map(()=>mesh(new T.SphereGeometry(8,24,16),new T.MeshStandardMaterial({color:0xffffff,metalness:.85,roughness:.12}),454,655,8));
  const hitLamps=new Map<string,T.Mesh>();
  for(const [id,x,y] of [['launch',454,635],['horse',HORSE_TARGET.x,HORSE_TARGET.y],['spinner',395,285],['mode',240,475],['flipper-left',170,615],['flipper-right',310,615]] as [string,number,number][]){
    const lamp=cylinder(x,y,id==='mode'?14:7,2,new T.MeshStandardMaterial({color:0xffc960,emissive:0xffb638,emissiveIntensity:.15}),2);hitLamps.set(id,lamp);
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let trailHistory=new WeakMap<object,T.Vector3[]>(),wasTripping=false;
  const trails=balls.map(()=>Array.from({length:8},(_,i)=>{
    const ghost=mesh(new T.SphereGeometry(8,12,8),new T.MeshBasicMaterial({color:[0xff39bd,0x50e9ff,0xc2ff4f][i%3],transparent:true,opacity:(1-i/9)*.32,depthWrite:false,blending:T.AdditiveBlending}),0,0,8);ghost.visible=false;return ghost;
  }));
  // Softbox reflection gives the chrome ball and rails readable highlights.
  const envScene=new T.Scene();envScene.background=new T.Color(0x777f95);for(const [x,y,z] of [[-300,300,0],[250,400,-200]]){const panel=new T.Mesh(new T.PlaneGeometry(300,500),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);envScene.add(panel);}const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(envScene);scene.environment=env.texture;pmrem.dispose();
  return{draw(g:TableState,angles:{left:number;right:number}){
    resize();
    danceLamps.forEach((lamp,i)=>{const material=lamp.material as T.MeshStandardMaterial;material.emissiveIntensity=reduced.matches?.5:(g.mode.club>0?1.4:.35)+Math.max(0,Math.sin(g.remaining+i*.65+g.score*.013))*.65;});
    const flash=(id:string)=>reduced.matches?0:Math.max(0,(g.flashes[id]??0)/.18);
    hitLamps.forEach((m,id)=>{const material=m.material as T.MeshStandardMaterial;material.emissiveIntensity=.15+flash(id)*3+(id==='mode'&&(g.mode.kind!=='normal'||g.mode.club>0)?1:0);material.emissive.setHex(id==='mode'&&g.mode.kind==='khole'?0xb36dff:0xffb638);});
    clubMarkers.forEach(m=>{m.visible=g.mode.club>0;});
    const settings=flipperSettings(g.mode),tripping=g.mode.kind==='khole'&&!reduced.matches;
    if(!tripping&&wasTripping)trailHistory=new WeakMap();wasTripping=tripping;
    flippers.forEach((f,i)=>{f.scale.set(settings.length/60,1,settings.radius/7);const stripe=f.children[1] as T.Mesh;const material=stripe.material as T.MeshStandardMaterial;material.color.setHex(g.mode.club>0?(i===0?0xffd544:0xb36dff):g.mode.kind==='pep'?0xffd544:0xb62031);});
    pepLamps.forEach((m,i)=>{(m.material as T.MeshStandardMaterial).emissiveIntensity=g.mode.pepLanes[i]?2:.1;});
    flippers[0].rotation.y=-angles.left;flippers[1].rotation.y=-angles.right;
    const visible=g.balls.length?g.balls:g.remaining>0?[{x:454,y:655}]:[];
    balls.forEach((m,i)=>{const b=visible[i];m.visible=!!b;if(b)m.position.copy(pos(b.x,b.y,8+('height' in b?(b.height??0):0)));});
    trails.forEach((row,i)=>{const b=g.balls[i];let history=b?trailHistory.get(b):undefined;if(b&&tripping){if(!history){history=[];trailHistory.set(b,history);}history.unshift(pos(b.x,b.y,8+(b.height??0)));history.splice(16);}
      row.forEach((ghost,j)=>{const point=history?.[j*2+1];ghost.visible=tripping&&!!b&&!!point;if(ghost.visible){ghost.position.copy(point!);ghost.scale.setScalar(1+j*.035);}});
    });
    inserts.forEach((m,i)=>{(m.material as T.MeshStandardMaterial).emissiveIntensity=i<g.letters||g.bonus>0?2:.05;});
    targets.forEach((t,i)=>{t.position.y=g.targets[i]?4:18;const material=t.material as T.MeshStandardMaterial;material.emissive.setHex(0xffb638);material.emissiveIntensity=flash(`target-${i}`)*3+(g.targets[i]?.6:0);});windmill.rotation.y=g.score/500;
    bumpers.forEach((b,i)=>{const material=b.material as T.MeshStandardMaterial;material.emissive.setHex(0xff6820);material.emissiveIntensity=.08+flash(`speaker-${i}`)*3+(g.bonus>0?.6:0);});
    renderer.render(scene,camera);canvas.dataset.rendered='true';
  },dispose(){disposed=true;printedArt.dispose();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});texture.dispose();masonryTexture.dispose();env.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
