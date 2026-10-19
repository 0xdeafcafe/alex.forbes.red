import {html} from 'htm/preact';
import type {VNode} from 'preact';
import {useEffect,useRef} from 'preact/hooks';

/** A small demoscene-style fragment shader; the CSS artwork remains its fallback. */
export function KeygenPlasma({active}:{active:boolean}):VNode {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const surface=canvas.current;if(!surface||!active)return;
    const gl=surface.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
    let frame=0,visible=true,last=0,elapsed=0,disposed=false,contextLost=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const compile=(type:number,source:string)=>{const shader=gl.createShader(type);if(!shader)return null;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;};
    const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}');
    const fragment=compile(gl.FRAGMENT_SHADER,`
      precision mediump float; varying vec2 uv; uniform float time; uniform float aspect;
      void main(){
        vec2 p=(uv-.5)*vec2(aspect,1.); float t=time*.24;
        float a=atan(p.y,p.x); float r=length(p);
        vec2 q=p+vec2(sin(p.y*4.+t),cos(p.x*3.-t))*.16;
        float f=sin(q.x*6.+t)+sin(q.y*7.-t*1.3)+sin((q.x+q.y)*5.+t*.7);
        float rays=sin(a*8.+r*13.-t*2.)*.5+.5;
        vec3 blue=vec3(.12,.16,.66),rose=vec3(.87,.43,.65),peach=vec3(1.,.76,.61);
        vec3 col=mix(blue,rose,smoothstep(-1.8,1.8,f));
        col=mix(col,peach,pow(rays,3.)*.55);
        float filaments=pow(.5+.5*sin(a*27.+sin(r*23.-t)*2.+r*36.),14.);
        col+=filaments*.09; col+=vec3(.12,.07,.15)*sin((uv.x-uv.y)*28.+t);
        col*=.95+.05*sin(gl_FragCoord.y*3.14159265); col*=1.-.24*dot(p,p);
        gl_FragColor=vec4(col,1.);
      }`);
    if(!vertex||!fragment){if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);return;}
    const program=gl.createProgram();if(!program){gl.deleteShader(vertex);gl.deleteShader(fragment);return;}
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);return;}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);const point=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
    const time=gl.getUniformLocation(program,'time'),aspect=gl.getUniformLocation(program,'aspect');
    const draw=(now:number)=>{
      if(disposed||contextLost||gl.isContextLost()||document.hidden||!visible)return;
      const delta=last?Math.min(now-last,60):0;last=now;if(!reduced.matches)elapsed+=delta/1000;
      const scale=Math.min(devicePixelRatio||1,2);
      const width=Math.max(1,Math.round(surface.clientWidth*scale)),height=Math.max(1,Math.round(surface.clientHeight*scale));
      if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}
      gl.viewport(0,0,width,height);gl.uniform1f(time,elapsed);gl.uniform1f(aspect,width/height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);surface.dataset.ready='true';
      if(!reduced.matches)frame=requestAnimationFrame(draw);
    };
    const restart=()=>{cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(draw);};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();});observer.observe(surface);
    const resize=new ResizeObserver(restart);resize.observe(surface);
    const lost=(event:Event)=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);delete surface.dataset.ready;};
    surface.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);restart();
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();surface.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',restart);reduced.removeEventListener('change',restart);delete surface.dataset.ready;gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
  },[active]);
  return html`<canvas ref=${canvas} class="keygen-webgl" aria-hidden="true"/>`;
}
