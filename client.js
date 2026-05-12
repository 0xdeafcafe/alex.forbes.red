var Z,h,jt,Oe,M,Mt,Ut,Ft,_t,z,O,Rt,bt,ft,vt,It,Y={},Q=[],Be=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,tt=Array.isArray;function V(t,e){for(var r in e)t[r]=e[r];return t}function $t(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function et(t,e,r){var o,a,n,i={};for(n in e)n=="key"?o=e[n]:n=="ref"?a=e[n]:i[n]=e[n];if(arguments.length>2&&(i.children=arguments.length>3?Z.call(arguments,2):r),typeof t=="function"&&t.defaultProps!=null)for(n in t.defaultProps)i[n]===void 0&&(i[n]=t.defaultProps[n]);return J(t,i,o,a,null)}function J(t,e,r,o,a){var n={type:t,props:e,key:r,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++jt,__i:-1,__u:0};return a==null&&h.vnode!=null&&h.vnode(n),n}function b(t){return t.children}function B(t,e){this.props=t,this.context=e}function F(t,e){if(e==null)return t.__?F(t.__,t.__i+1):null;for(var r;e<t.__k.length;e++)if((r=t.__k[e])!=null&&r.__e!=null)return r.__e;return typeof t.type=="function"?F(t):null}function qe(t){if(t.__P&&t.__d){var e=t.__v,r=e.__e,o=[],a=[],n=V({},e);n.__v=e.__v+1,h.vnode&&h.vnode(n),yt(t.__P,n,e,t.__n,t.__P.namespaceURI,32&e.__u?[r]:null,o,r??F(e),!!(32&e.__u),a),n.__v=e.__v,n.__.__k[n.__i]=n,Bt(o,n,a),e.__e=e.__=null,n.__e!=r&&Ht(n)}}function Ht(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Ht(t)}function ht(t){(!t.__d&&(t.__d=!0)&&M.push(t)&&!X.__r++||Mt!=h.debounceRendering)&&((Mt=h.debounceRendering)||Ut)(X)}function X(){try{for(var t,e=1;M.length;)M.length>e&&M.sort(Ft),t=M.shift(),e=M.length,qe(t)}finally{M.length=X.__r=0}}function Wt(t,e,r,o,a,n,i,p,u,c,m){var s,d,_,y,T,k,f,v=o&&o.__k||Q,E=e.length;for(u=Ke(r,e,v,u,E),s=0;s<E;s++)(_=r.__k[s])!=null&&(d=_.__i!=-1&&v[_.__i]||Y,_.__i=s,k=yt(t,_,d,a,n,i,p,u,c,m),y=_.__e,_.ref&&d.ref!=_.ref&&(d.ref&&kt(d.ref,null,_),m.push(_.ref,_.__c||y,_)),T==null&&y!=null&&(T=y),(f=!!(4&_.__u))||d.__k===_.__k?(u=Ot(_,u,t,f),f&&d.__e&&(d.__e=null)):typeof _.type=="function"&&k!==void 0?u=k:y&&(u=y.nextSibling),_.__u&=-7);return r.__e=T,u}function Ke(t,e,r,o,a){var n,i,p,u,c,m=r.length,s=m,d=0;for(t.__k=new Array(a),n=0;n<a;n++)(i=e[n])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=t.__k[n]=J(null,i,null,null,null):tt(i)?i=t.__k[n]=J(b,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=t.__k[n]=J(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):t.__k[n]=i,u=n+d,i.__=t,i.__b=t.__b+1,p=null,(c=i.__i=Ge(i,r,u,s))!=-1&&(s--,(p=r[c])&&(p.__u|=2)),p==null||p.__v==null?(c==-1&&(a>m?d--:a<m&&d++),typeof i.type!="function"&&(i.__u|=4)):c!=u&&(c==u-1?d--:c==u+1?d++:(c>u?d--:d++,i.__u|=4))):t.__k[n]=null;if(s)for(n=0;n<m;n++)(p=r[n])!=null&&(2&p.__u)==0&&(p.__e==o&&(o=F(p)),Kt(p,p));return o}function Ot(t,e,r,o){var a,n;if(typeof t.type=="function"){for(a=t.__k,n=0;a&&n<a.length;n++)a[n]&&(a[n].__=t,e=Ot(a[n],e,r,o));return e}t.__e!=e&&(o&&(e&&t.type&&!e.parentNode&&(e=F(t)),r.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Ge(t,e,r,o){var a,n,i,p=t.key,u=t.type,c=e[r],m=c!=null&&(2&c.__u)==0;if(c===null&&p==null||m&&p==c.key&&u==c.type)return r;if(o>(m?1:0)){for(a=r-1,n=r+1;a>=0||n<e.length;)if((c=e[i=a>=0?a--:n++])!=null&&(2&c.__u)==0&&p==c.key&&u==c.type)return i}return-1}function Dt(t,e,r){e[0]=="-"?t.setProperty(e,r??""):t[e]=r==null?"":typeof r!="number"||Be.test(e)?r:r+"px"}function G(t,e,r,o,a){var n,i;t:if(e=="style")if(typeof r=="string")t.style.cssText=r;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)r&&e in r||Dt(t.style,e,"");if(r)for(e in r)o&&r[e]==o[e]||Dt(t.style,e,r[e])}else if(e[0]=="o"&&e[1]=="n")n=e!=(e=e.replace(Rt,"$1")),i=e.toLowerCase(),e=i in t||e=="onFocusOut"||e=="onFocusIn"?i.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+n]=r,r?o?r[O]=o[O]:(r[O]=bt,t.addEventListener(e,n?vt:ft,n)):t.removeEventListener(e,n?vt:ft,n);else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=r??"";break t}catch{}typeof r=="function"||(r==null||r===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&r==1?"":r))}}function Lt(t){return function(e){if(this.l){var r=this.l[e.type+t];if(e[z]==null)e[z]=bt++;else if(e[z]<r[O])return;return r(h.event?h.event(e):e)}}}function yt(t,e,r,o,a,n,i,p,u,c){var m,s,d,_,y,T,k,f,v,E,j,W,Et,K,mt,N=e.type;if(e.constructor!==void 0)return null;128&r.__u&&(u=!!(32&r.__u),n=[p=e.__e=r.__e]),(m=h.__b)&&m(e);t:if(typeof N=="function")try{if(f=e.props,v=N.prototype&&N.prototype.render,E=(m=N.contextType)&&o[m.__c],j=m?E?E.props.value:m.__:o,r.__c?k=(s=e.__c=r.__c).__=s.__E:(v?e.__c=s=new N(f,j):(e.__c=s=new B(f,j),s.constructor=N,s.render=Je),E&&E.sub(s),s.state||(s.state={}),s.__n=o,d=s.__d=!0,s.__h=[],s._sb=[]),v&&s.__s==null&&(s.__s=s.state),v&&N.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=V({},s.__s)),V(s.__s,N.getDerivedStateFromProps(f,s.__s))),_=s.props,y=s.state,s.__v=e,d)v&&N.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),v&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(v&&N.getDerivedStateFromProps==null&&f!==_&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(f,j),e.__v==r.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(f,s.__s,j)===!1){e.__v!=r.__v&&(s.props=f,s.state=s.__s,s.__d=!1),e.__e=r.__e,e.__k=r.__k,e.__k.some(function(U){U&&(U.__=e)}),Q.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&i.push(s);break t}s.componentWillUpdate!=null&&s.componentWillUpdate(f,s.__s,j),v&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(_,y,T)})}if(s.context=j,s.props=f,s.__P=t,s.__e=!1,W=h.__r,Et=0,v)s.state=s.__s,s.__d=!1,W&&W(e),m=s.render(s.props,s.state,s.context),Q.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,W&&W(e),m=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++Et<25);s.state=s.__s,s.getChildContext!=null&&(o=V(V({},o),s.getChildContext())),v&&!d&&s.getSnapshotBeforeUpdate!=null&&(T=s.getSnapshotBeforeUpdate(_,y)),K=m!=null&&m.type===b&&m.key==null?qt(m.props.children):m,p=Wt(t,tt(K)?K:[K],e,r,o,a,n,i,p,u,c),s.base=e.__e,e.__u&=-161,s.__h.length&&i.push(s),k&&(s.__E=s.__=null)}catch(U){if(e.__v=null,u||n!=null)if(U.then){for(e.__u|=u?160:128;p&&p.nodeType==8&&p.nextSibling;)p=p.nextSibling;n[n.indexOf(p)]=null,e.__e=p}else{for(mt=n.length;mt--;)$t(n[mt]);gt(e)}else e.__e=r.__e,e.__k=r.__k,U.then||gt(e);h.__e(U,e,r)}else n==null&&e.__v==r.__v?(e.__k=r.__k,e.__e=r.__e):p=e.__e=ze(r.__e,e,r,o,a,n,i,u,c);return(m=h.diffed)&&m(e),128&e.__u?void 0:p}function gt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(gt))}function Bt(t,e,r){for(var o=0;o<r.length;o++)kt(r[o],r[++o],r[++o]);h.__c&&h.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(n){n.call(a)})}catch(n){h.__e(n,a.__v)}})}function qt(t){return typeof t!="object"||t==null||t.__b>0?t:tt(t)?t.map(qt):V({},t)}function ze(t,e,r,o,a,n,i,p,u){var c,m,s,d,_,y,T,k=r.props||Y,f=e.props,v=e.type;if(v=="svg"?a="http://www.w3.org/2000/svg":v=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),n!=null){for(c=0;c<n.length;c++)if((_=n[c])&&"setAttribute"in _==!!v&&(v?_.localName==v:_.nodeType==3)){t=_,n[c]=null;break}}if(t==null){if(v==null)return document.createTextNode(f);t=document.createElementNS(a,v,f.is&&f),p&&(h.__m&&h.__m(e,n),p=!1),n=null}if(v==null)k===f||p&&t.data==f||(t.data=f);else{if(n=n&&Z.call(t.childNodes),!p&&n!=null)for(k={},c=0;c<t.attributes.length;c++)k[(_=t.attributes[c]).name]=_.value;for(c in k)_=k[c],c=="dangerouslySetInnerHTML"?s=_:c=="children"||c in f||c=="value"&&"defaultValue"in f||c=="checked"&&"defaultChecked"in f||G(t,c,null,_,a);for(c in f)_=f[c],c=="children"?d=_:c=="dangerouslySetInnerHTML"?m=_:c=="value"?y=_:c=="checked"?T=_:p&&typeof _!="function"||k[c]===_||G(t,c,_,k[c],a);if(m)p||s&&(m.__html==s.__html||m.__html==t.innerHTML)||(t.innerHTML=m.__html),e.__k=[];else if(s&&(t.innerHTML=""),Wt(e.type=="template"?t.content:t,tt(d)?d:[d],e,r,o,v=="foreignObject"?"http://www.w3.org/1999/xhtml":a,n,i,n?n[0]:r.__k&&F(r,0),p,u),n!=null)for(c=n.length;c--;)$t(n[c]);p||(c="value",v=="progress"&&y==null?t.removeAttribute("value"):y!=null&&(y!==t[c]||v=="progress"&&!y||v=="option"&&y!=k[c])&&G(t,c,y,k[c],a),c="checked",T!=null&&T!=t[c]&&G(t,c,T,k[c],a))}return t}function kt(t,e,r){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(a){h.__e(a,r)}}function Kt(t,e,r){var o,a;if(h.unmount&&h.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||kt(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(n){h.__e(n,e)}o.base=o.__P=null}if(o=t.__k)for(a=0;a<o.length;a++)o[a]&&Kt(o[a],e,r||typeof t.type!="function");r||$t(t.__e),t.__c=t.__=t.__e=void 0}function Je(t,e,r){return this.constructor(t,r)}function Gt(t,e,r){var o,a,n,i;e==document&&(e=document.documentElement),h.__&&h.__(t,e),a=(o=typeof r=="function")?null:r&&r.__k||e.__k,n=[],i=[],yt(e,t=(!o&&r||e).__k=et(b,null,[t]),a||Y,Y,e.namespaceURI,!o&&r?[r]:a?null:e.firstChild?Z.call(e.childNodes):null,n,!o&&r?r:a?a.__e:e.firstChild,o,i),Bt(n,t,i)}function wt(t,e){Gt(t,e,wt)}function St(t){function e(r){var o,a;return this.getChildContext||(o=new Set,(a={})[e.__c]=this,this.getChildContext=function(){return a},this.componentWillUnmount=function(){o=null},this.shouldComponentUpdate=function(n){this.props.value!=n.value&&o.forEach(function(i){i.__e=!0,ht(i)})},this.sub=function(n){o.add(n);var i=n.componentWillUnmount;n.componentWillUnmount=function(){o&&o.delete(n),i&&i.call(n)}}),r.children}return e.__c="__cC"+It++,e.__=t,e.Provider=e.__l=(e.Consumer=function(r,o){return r.children(o)}).contextType=e,e}Z=Q.slice,h={__e:function(t,e,r,o){for(var a,n,i;e=e.__;)if((a=e.__c)&&!a.__)try{if((n=a.constructor)&&n.getDerivedStateFromError!=null&&(a.setState(n.getDerivedStateFromError(t)),i=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(t,o||{}),i=a.__d),i)return a.__E=a}catch(p){t=p}throw t}},jt=0,Oe=function(t){return t!=null&&t.constructor===void 0},B.prototype.setState=function(t,e){var r;r=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=V({},this.state),typeof t=="function"&&(t=t(V({},r),this.props)),t&&V(r,t),t!=null&&this.__v&&(e&&this._sb.push(e),ht(this))},B.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ht(this))},B.prototype.render=b,M=[],Ut=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ft=function(t,e){return t.__v.__b-e.__v.__b},X.__r=0,_t=Math.random().toString(8),z="__d"+_t,O="__a"+_t,Rt=/(PointerCapture)$|Capture$/i,bt=0,ft=Lt(!1),vt=Lt(!0),It=0;var Jt=function(t,e,r,o){var a;e[0]=0;for(var n=1;n<e.length;n++){var i=e[n++],p=e[n]?(e[0]|=i?1:2,r[e[n++]]):e[++n];i===3?o[0]=p:i===4?o[1]=Object.assign(o[1]||{},p):i===5?(o[1]=o[1]||{})[e[++n]]=p:i===6?o[1][e[++n]]+=p+"":i?(a=t.apply(p,Jt(t,p,r,["",null])),o.push(a),p[0]?e[0]|=2:(e[n-2]=0,e[n]=a)):o.push(p)}return o},zt=new Map;function Yt(t){var e=zt.get(this);return e||(e=new Map,zt.set(this,e)),(e=Jt(this,e.get(t)||(e.set(t,e=(function(r){for(var o,a,n=1,i="",p="",u=[0],c=function(d){n===1&&(d||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?u.push(0,d,i):n===3&&(d||i)?(u.push(3,d,i),n=2):n===2&&i==="..."&&d?u.push(4,d,0):n===2&&i&&!d?u.push(5,0,!0,i):n>=5&&((i||!d&&n===5)&&(u.push(n,0,i,a),n=6),d&&(u.push(n,d,0,a),n=6)),i=""},m=0;m<r.length;m++){m&&(n===1&&c(),c(m));for(var s=0;s<r[m].length;s++)o=r[m][s],n===1?o==="<"?(c(),u=[u],n=3):i+=o:n===4?i==="--"&&o===">"?(n=1,i=""):i=o+i[0]:p?o===p?p="":i+=o:o==='"'||o==="'"?p=o:o===">"?(c(),n=1):n&&(o==="="?(n=5,a=i,i=""):o==="/"&&(n<5||r[m][s+1]===">")?(c(),n===3&&(u=u[0]),n=u,(u=u[0]).push(2,0,n),n=0):o===" "||o==="	"||o===`
`||o==="\r"?(c(),n=2):i+=o),n===3&&i==="!--"&&(n=4,u=u[0])}return c(),u})(t)),e),arguments,[])).length>1?e:e[0]}var l=Yt.bind(et);import Tr from"/data.json"with{type:"json"};var R,g,Pt,Qt,q=0,ae=[],$=h,Xt=$.__b,Zt=$.__r,te=$.diffed,ee=$.__c,re=$.unmount,oe=$.__;function ot(t,e){$.__h&&$.__h(g,t,q||e),q=0;var r=g.__H||(g.__H={__:[],__h:[]});return t>=r.__.length&&r.__.push({}),r.__[t]}function w(t){return q=1,Ye(le,t)}function Ye(t,e,r){var o=ot(R++,2);if(o.t=t,!o.__c&&(o.__=[r?r(e):le(void 0,e),function(p){var u=o.__N?o.__N[0]:o.__[0],c=o.t(u,p);u!==c&&(o.__N=[c,o.__[1]],o.__c.setState({}))}],o.__c=g,!g.__f)){var a=function(p,u,c){if(!o.__c.__H)return!0;var m=o.__c.__H.__.filter(function(d){return d.__c});if(m.every(function(d){return!d.__N}))return!n||n.call(this,p,u,c);var s=o.__c.props!==p;return m.some(function(d){if(d.__N){var _=d.__[0];d.__=d.__N,d.__N=void 0,_!==d.__[0]&&(s=!0)}}),n&&n.call(this,p,u,c)||s};g.__f=!0;var n=g.shouldComponentUpdate,i=g.componentWillUpdate;g.componentWillUpdate=function(p,u,c){if(this.__e){var m=n;n=void 0,a(p,u,c),n=m}i&&i.call(this,p,u,c)},g.shouldComponentUpdate=a}return o.__N||o.__}function S(t,e){var r=ot(R++,3);!$.__s&&se(r.__H,e)&&(r.__=t,r.u=e,g.__H.__h.push(r))}function ie(t){return q=5,nt(function(){return{current:t}},[])}function nt(t,e){var r=ot(R++,7);return se(r.__H,e)&&(r.__=t(),r.__H=e,r.__h=t),r.__}function at(t,e){return q=8,nt(function(){return t},e)}function At(t){var e=g.context[t.__c],r=ot(R++,9);return r.c=t,e?(r.__==null&&(r.__=!0,e.sub(g)),e.props.value):t.__}function Qe(){for(var t;t=ae.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(rt),e.__h.some(xt),e.__h=[]}catch(r){e.__h=[],$.__e(r,t.__v)}}}$.__b=function(t){g=null,Xt&&Xt(t)},$.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),oe&&oe(t,e)},$.__r=function(t){Zt&&Zt(t),R=0;var e=(g=t.__c).__H;e&&(Pt===g?(e.__h=[],g.__h=[],e.__.some(function(r){r.__N&&(r.__=r.__N),r.u=r.__N=void 0})):(e.__h.some(rt),e.__h.some(xt),e.__h=[],R=0)),Pt=g},$.diffed=function(t){te&&te(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(ae.push(e)!==1&&Qt===$.requestAnimationFrame||((Qt=$.requestAnimationFrame)||Xe)(Qe)),e.__H.__.some(function(r){r.u&&(r.__H=r.u),r.u=void 0})),Pt=g=null},$.__c=function(t,e){e.some(function(r){try{r.__h.some(rt),r.__h=r.__h.filter(function(o){return!o.__||xt(o)})}catch(o){e.some(function(a){a.__h&&(a.__h=[])}),e=[],$.__e(o,r.__v)}}),ee&&ee(t,e)},$.unmount=function(t){re&&re(t);var e,r=t.__c;r&&r.__H&&(r.__H.__.some(function(o){try{rt(o)}catch(a){e=a}}),r.__H=void 0,e&&$.__e(e,r.__v))};var ne=typeof requestAnimationFrame=="function";function Xe(t){var e,r=function(){clearTimeout(o),ne&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(r,35);ne&&(e=requestAnimationFrame(r))}function rt(t){var e=g,r=t.__c;typeof r=="function"&&(t.__c=void 0,r()),g=e}function xt(t){var e=g;t.__c=t.__(),g=e}function se(t,e){return!t||t.length!==e.length||e.some(function(r,o){return r!==t[o]})}function le(t,e){return typeof e=="function"?e(t):e}var D=["quickplay","collection","music","projects","words","photography"],I="quickplay";function Tt(t){let e=t.replace(/\/+$/,"").replace(/^\/+/,"");return e?D.includes(e)?e:null:I}function Ct(t){return t===I?"/":`/${t}`}var it=["zune","magenta","orange","lime","cyan"],st="zune",ce="afr-accent",lt=St({pivot:I,setPivot:()=>{},back:()=>{},canGoBack:!1}),ct=St({accent:st,cycle:()=>{}}),Ze=t=>!!t&&it.includes(t);function C(){return At(lt)}function pe(){return At(ct)}function ue(t){let[e,r]=w(()=>t||(typeof window<"u"?Tt(window.location.pathname)??I:I)),[o,a]=w(0);S(()=>{let p=()=>{r(Tt(location.pathname)??I),a(u=>Math.max(0,u-1))};return window.addEventListener("popstate",p),()=>window.removeEventListener("popstate",p)},[]);let n=at(p=>{r(u=>{if(u===p)return u;let c=Ct(p);return location.pathname!==c&&history.pushState(null,"",c),a(m=>m+1),window.scrollTo({top:0,behavior:"smooth"}),p})},[]),i=at(()=>{o>0&&history.back()},[o]);return{pivot:e,setPivot:n,back:i,canGoBack:o>0}}function de(){let[t,e]=w(()=>{if(typeof window>"u")return st;try{let o=localStorage.getItem(ce);return Ze(o)?o:st}catch{return st}});S(()=>{document.documentElement.dataset.accent=t;try{localStorage.setItem(ce,t)}catch{}},[t]);let r=at(()=>{e(o=>it[(it.indexOf(o)+1)%it.length])},[]);return{accent:t,cycle:r}}function me(){let{pivot:t,setPivot:e}=C();S(()=>{let r=o=>{if(o.key!=="ArrowLeft"&&o.key!=="ArrowRight")return;let a=document.activeElement?.tagName??"";if(a==="INPUT"||a==="TEXTAREA"||o.altKey||o.metaKey||o.ctrlKey)return;let n=D.indexOf(t),i=o.key==="ArrowRight"?(n+1)%D.length:(n-1+D.length)%D.length;e(D[i])};return document.addEventListener("keydown",r),()=>document.removeEventListener("keydown",r)},[t,e])}function _e(){let{setPivot:t}=C();S(()=>{let e=r=>{if(r.metaKey||r.ctrlKey||r.shiftKey||r.altKey||r.button!==0)return;let o=r.target?.closest("a[href]");if(!o||o.target&&o.target!=="_self")return;let a=o.getAttribute("href")??"";if(!a.startsWith("/")||a.startsWith("//"))return;let n=a.split("?")[0].split("#")[0],i=Tt(n);i&&(r.preventDefault(),t(i))};return document.addEventListener("click",e),()=>document.removeEventListener("click",e)},[t])}function fe(){return l`
    <div class="ambient">
      <div class="ambient-blob b1"></div>
      <div class="ambient-blob b2"></div>
    </div>
  `}function P(t){return String(t).split(/\s+/).map(e=>e.replace(/[^A-Za-z0-9]/g,"")[0]).filter(Boolean).slice(0,2).join("").toUpperCase()}function L(t){if(!t)return"";let e=new Date(t).getTime();if(Number.isNaN(e))return"";let r=Math.max(0,Date.now()-e),o=Math.floor(r/6e4);if(o<1)return"just now";if(o<60)return`${o}m ago`;let a=Math.floor(o/60);if(a<24)return`${a}h ago`;let n=Math.floor(a/24);if(n<7)return`${n}d ago`;let i=Math.floor(n/7);return i<5?`${i}w ago`:new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function pt(t){return t?t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?Math.round(t/1e3)+"K":String(t):""}function ut(t){return`${t.artist}__${t.name}`.replace(/[^A-Za-z0-9_]/g,"_")}function Nt(t){return t==null?"":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":String(t)}var tr=220,er=1700;function ve(t){return t.kind==="album"?t.coverUrl?`background-image: url("${t.coverUrl}")`:`background: linear-gradient(135deg, ${t.c1}, ${t.c2})`:`background-image: url("${t.url}")`}function he(t){let e=t.slice();for(let r=e.length-1;r>0;r--){let o=Math.floor(Math.random()*(r+1));[e[r],e[o]]=[e[o],e[r]]}return e}function rr(t){let e=[...t.albums.map(a=>({kind:"album",coverUrl:a.coverUrl,c1:a.c1,c2:a.c2,mono:P(a.artist)})),...t.photos.map(a=>({kind:"photo",url:a.url}))];if(!e.length)return[];let r=he(Array.from({length:tr},(a,n)=>e[n%e.length])),o=he(e.slice());return r.map((a,n)=>({front:a,back:o[n%o.length]}))}function ge({data:t}){let[e,r]=w(!1);S(()=>r(!0),[]);let o=nt(()=>e?rr(t):[],[e,t]),[a,n]=w(()=>new Set);return S(()=>{if(!o.length)return;let i=window.setInterval(()=>{n(p=>{let u=new Set(p),c=1+Math.floor(Math.random()*3);for(let m=0;m<c;m++){let s=Math.floor(Math.random()*o.length);u.has(s)?u.delete(s):u.add(s)}return u})},er);return()=>window.clearInterval(i)},[o.length]),S(()=>{let i=null,p=()=>{document.body.classList.add("scrolling-mode"),i&&window.clearTimeout(i),i=window.setTimeout(()=>document.body.classList.remove("scrolling-mode"),600)};return window.addEventListener("scroll",p,{passive:!0}),()=>{window.removeEventListener("scroll",p),i&&window.clearTimeout(i)}},[]),l`
    <div class="tile-bg" aria-hidden="true">
      ${o.map((i,p)=>{let u=a.has(p);return l`
          <div class=${`bg-tile${u?" flipped":""}`}>
            <div class="bg-tile-face front" style=${ve(i.front)}>
              ${i.front.kind==="album"&&!i.front.coverUrl?i.front.mono:""}
            </div>
            <div class="bg-tile-face back" style=${ve(i.back)}>
              ${i.back.kind==="album"&&!i.back.coverUrl?i.back.mono:""}
            </div>
          </div>
        `})}
    </div>
  `}function be(){let{back:t,canGoBack:e}=C(),{cycle:r}=pe();return l`
    <header class="chrome-bar">
      <div class="chrome-left">
        <button class="nav-back" aria-label="Back" disabled=${!e} onClick=${t}>
          <i data-lucide="arrow-left"></i>
        </button>
        <div class="brand">
          <span>afr</span><span class="brand-dot">.</span>
        </div>
      </div>

      <div class="chrome-actions">
        <button aria-label="Cycle accent theme" onClick=${r}>
          <span class="theme-dot" aria-hidden="true"></span>THEME
        </button>
        <span class="sep">|</span>
        <a href="https://github.com/0xdeafcafe/alex.forbes.red" target="_blank" rel="noopener noreferrer">SOURCE</a>
      </div>

      <div class="identity">
        <div class="identity-text">
          <span class="identity-name">ALEX F-R</span>
          <span class="identity-stat"><strong>@LANGWATCH</strong> · AMS</span>
        </div>
        <a class="avatar-tile" href="/collection" aria-label="About">
          <span>AF</span>
        </a>
      </div>
    </header>
  `}var or={quickplay:"QUICKPLAY",collection:"COLLECTION",music:"MUSIC",projects:"PROJECTS",words:"WORDS",photography:"PHOTOGRAPHY"};function $e(){let{pivot:t,setPivot:e}=C();return l`
    <div class="pivot-nav-wrap">
      <div class="pivot-strip" aria-hidden="true"></div>
      <nav class="pivot-nav" role="tablist">
        ${D.map(r=>l`
          <button
            class=${`pivot${r===t?" active":""}`}
            role="tab"
            onClick=${()=>e(r)}
          >${or[r]}</button>
        `)}
      </nav>
    </div>
  `}var ye=[{c1:"#ffb347",c2:"#5a1d04"},{c1:"#ff7a1c",c2:"#0a0500"},{c1:"#5a3010",c2:"#0a0a0a"},{c1:"#ff5a8a",c2:"#1a0a3a"},{c1:"#fde68a",c2:"#5d2a0a"},{c1:"#5d6d7e",c2:"#0a0a14"},{c1:"#3d2410",c2:"#0a0a0a"},{c1:"#1a1a1a",c2:"#000000"},{c1:"#04405d",c2:"#01081a"},{c1:"#a06030",c2:"#1c0e07"},{c1:"#444444",c2:"#0a0a0a"},{c1:"#1a1a3e",c2:"#0a0a14"},{c1:"#a06420",c2:"#1a0a04"},{c1:"#3a0050",c2:"#0a0a0a"},{c1:"#5b8a3a",c2:"#0a1004"},{c1:"#2a3d5d",c2:"#050a14"},{c1:"#ff6b3c",c2:"#1a0500"},{c1:"#d22a8a",c2:"#1a0a14"}];function x(t){let e=0;for(let r=0;r<t.length;r++)e=e*31+t.charCodeAt(r)>>>0;return ye[e%ye.length]}var nr=7e3,ar=6e4,ir=420;function sr(t){let e=[],r=t.recentlyPlayed[0];r&&e.push({label:"LAST SPUN",title:r.name,sub:r.artist,coverUrl:r.coverUrl,paletteSeed:`${r.artist}::${r.album||r.name}`,monoSeed:r.artist,timestamp:r.endTime,pivot:"music",anchor:"music-recent-section"});let o=t.photos[0];o?.url&&e.push({label:"LAST SNAPPED",title:o.title||"untitled",sub:o.loc||"instagram",coverUrl:o.url,paletteSeed:o.title||"photo",monoSeed:o.title||"AF",timestamp:o.takenAt,pivot:"photography"});let a=t.words[0];a&&e.push({label:"LAST SCRAWLED",title:a.title,sub:a.source,paletteSeed:a.title,monoSeed:a.title,pivot:"words"});let n=t.projects[0];return n&&e.push({label:"LAST VIBED",title:n.name,sub:n.tag,paletteSeed:n.name,monoSeed:n.name,pivot:"projects"}),e}function lr({mode:t}){let e=x(t.paletteSeed),r=t.coverUrl?"":`background: linear-gradient(135deg, ${e.c1}, ${e.c2})`;return l`
    <div class=${`last-spun-art${t.coverUrl?" has-art":""}`} style=${r}>
      ${t.coverUrl?l`<img src=${t.coverUrl} alt=${`${t.title} \u2014 ${t.sub}`} loading="lazy" />`:l`<div class="last-spun-mono">${P(t.monoSeed)}</div>`}
    </div>
    <div class="last-spun-info">
      <div class="last-spun-meta">
        <span class="np-equalizer">
          <span class="np-bar"></span><span class="np-bar"></span><span class="np-bar"></span>
        </span>
        <span class="last-spun-label">${t.label}</span>
        ${t.timestamp?l`<span class="last-spun-sep">·</span><span>${L(t.timestamp)}</span>`:null}
      </div>
      <div class="last-spun-track">
        <span class="last-spun-name">${t.title}</span>
        <span class="last-spun-sep">·</span>
        <span class="last-spun-artist">${t.sub}</span>
      </div>
    </div>
    <i data-lucide="arrow-up-right" class="last-spun-arrow"></i>
  `}function ke({data:t}){let e=sr(t),{setPivot:r}=C(),[o,a]=w(0),[n,i]=w("idle"),[,p]=w(0),u=ie(null);if(S(()=>{if(e.length<2)return;let d=window.setInterval(()=>{i("swapping"),u.current=window.setTimeout(()=>{a(_=>(_+1)%e.length),i("entering"),window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>i("idle"))})},ir)},nr);return()=>{window.clearInterval(d),u.current&&window.clearTimeout(u.current)}},[e.length]),S(()=>{let d=window.setInterval(()=>p(_=>_+1),ar);return()=>window.clearInterval(d)},[]),!e.length)return null;let c=e[o];return l`
    <footer class=${`last-spun${n==="swapping"?" is-swapping":""}${n==="entering"?" is-entering":""}`}>
      <a class="last-spun-link" href="#" onClick=${d=>{if(d.preventDefault(),r(c.pivot),c.anchor){let _=c.anchor;window.setTimeout(()=>{document.getElementById(_)?.scrollIntoView({behavior:"smooth",block:"start"})},400)}}}>
        <${lr} mode=${c} />
      </a>
    </footer>
  `}function H({action:t,featured:e=!1}){let r="tile action-tile"+(e?" featured tile-big":""),o=[];t.c1&&o.push(`--c1: ${t.c1}`),t.c2&&o.push(`--c2: ${t.c2}`);let a=o.length?o.join("; "):void 0;return l`
    <a class=${r} href=${Ct(t.pivot)} style=${a}>
      <div class="action-tile-icon"><i data-lucide=${t.icon} /></div>
      <div class="action-tile-body">
        <div class="action-tile-name">${t.name}</div>
        <div class="action-tile-tag">${t.tag}</div>
      </div>
    </a>
  `}function we({album:t,big:e=!1}){let r=t.url?"a":"div",o=t.url?{href:t.url,target:"_blank",rel:"noopener noreferrer"}:{},a="tile"+(e?" tile-big":"")+(t.coverUrl?" has-art":"");return l`
    <${r}
      ...${o}
      class=${a}
      style=${`--c1: ${t.c1||""}; --c2: ${t.c2||""}`}
      data-album-key=${ut(t)}
    >
      ${t.coverUrl?l`<img class="tile-art" src=${t.coverUrl} alt=${`${t.artist} \u2014 ${t.name}`} loading="lazy" />`:null}
      <div class="tile-mono">${P(t.artist)}</div>
      <div class="tile-grad" />
      <div class="tile-body">
        <div class="tile-artist">${t.artist}</div>
        <div class="tile-name">${t.name}</div>
      </div>
    </${r}>
  `}function Se({item:t}){let e=t.url?"a":"div",r=t.url?{href:t.url,target:"_blank",rel:"noopener noreferrer"}:{},o=t.c1?{c1:t.c1,c2:t.c2}:x(t.name||""),a="smart-tile"+(t.image?" has-art":""),n=t.followers?`${pt(t.followers)} FANS`:"SMART DJ";return l`
    <${e} ...${r} class=${a} style=${`--c1: ${o.c1}; --c2: ${o.c2}`}>
      ${t.image?l`<img class="smart-tile-art" src=${t.image} alt=${t.name} loading="lazy" />`:null}
      <div class="smart-tile-mono">${P(t.name)}</div>
      <div class="smart-tile-body">
        <div class="smart-tile-name">${(t.name||"").toLowerCase()}</div>
        <div class="smart-tile-tag">${n}</div>
      </div>
    </${e}>
  `}var cr=[{href:"https://github.com/0xdeafcafe",icon:"si-github",label:"GitHub"},{href:"https://instagram.com/afr.png",icon:"si-instagram",label:"Instagram"},{href:"https://linkedin.com/in/0xdeafcafe",icon:"si-linkedin",label:"LinkedIn"},{href:"https://twitter.com/0xdeafcafe",icon:"si-x",label:"Twitter / X"}];function dt(){return l`
    <div class="welcome-actions">
      ${cr.map(t=>l`
        <a class="welcome-btn" href=${t.href} target="_blank" rel="noopener noreferrer" aria-label=${t.label}>
          <span class="btn-circle"><i class=${`si ${t.icon}`}></i></span>
        </a>
      `)}
    </div>
  `}function pr({data:t}){return l`
    <${H}
      action=${{name:"browse the collection",tag:"OVERVIEW \xB7 ABOUT",icon:"compass",pivot:"collection"}}
      featured=${!0}
    />
    <${H} action=${{name:"music",tag:`${t.albums.length} ALBUMS`,icon:"music",pivot:"music",c1:"#2a1a4e",c2:"#0a0514"}} />
    <${H} action=${{name:"projects",tag:`${t.projects.length} REPOS`,icon:"code-2",pivot:"projects",c1:"#0a3a3a",c2:"#020a0a"}} />
    <${H} action=${{name:"words",tag:`${t.words.length} ESSAYS`,icon:"pen-line",pivot:"words",c1:"#1a1a3e",c2:"#0a0a14"}} />
    <${H} action=${{name:"photography",tag:`${t.photos.length} FRAMES`,icon:"camera",pivot:"photography",c1:"#3a2a18",c2:"#0a0805"}} />
  `}function ur(t,e){let r=new Set,o=[];for(let a of t){let n=`${a.artist}::${a.album||a.name}`;if(r.has(n))continue;r.add(n);let i=x(n);if(o.push({artist:a.artist,name:a.album||a.name,coverUrl:a.coverUrl,url:a.url,c1:i.c1,c2:i.c2}),o.length>=e)break}return o}function dr({data:t}){let e=ur(t.recentlyPlayed,5),r=e.length>=5?e:[t.albums[11]||t.albums[0],t.albums[8]||t.albums[1],t.albums[10]||t.albums[2],t.albums[14]||t.albums[3],t.albums[15]||t.albums[4]].filter(Boolean);return l`${r.map((o,a)=>l`<${we} album=${o} big=${a===0} />`)}`}function mr({data:t}){let e=t.topArtists.length?t.topArtists.slice(0,8).map(r=>({name:r.name,image:r.image,url:r.url,followers:r.followers})):t.albums.slice(0,8).map(r=>({name:r.artist,image:r.coverUrl,url:r.url,c1:r.c1,c2:r.c2}));return l`${e.map(r=>l`<${Se} item=${r} />`)}`}function Pe({data:t}){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">quickplay</div>
      <div class="quickplay">
        <div class="qp-rows">
          <div class="qp-col qp-welcome">
            <h2 class="welcome-title">yo i'm alex.</h2>
            <p class="welcome-summary">
              Founding Engineer @
              <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">LangWatch</a>.
              Amsterdam, NL.
            </p>
            <${dt} />
            <a class="welcome-more" href="/collection">
              more about me <i data-lucide="arrow-right"></i>
            </a>
          </div>
          <div class="qp-col qp-new">
            <h2 class="section-label-big section-label-with-arrow">start</h2>
            <div class="qp-grid"><${pr} data=${t} /></div>
          </div>
          <div class="qp-col qp-history">
            <h2 class="section-label-big section-label-with-arrow">history</h2>
            <div class="qp-grid"><${dr} data=${t} /></div>
          </div>
        </div>

        <div class="smart-dj">
          <h2 class="section-label-big section-label-with-arrow">smart dj</h2>
          <div class="smart-strip"><${mr} data=${t} /></div>
        </div>
      </div>
    </${b}>
  `}function xe(){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">collection</div>
      <div class="bio-block">
        <h2 class="bio-headline">
          i love working with and on <em>apis</em>, <em>reverse engineering</em>,
          <em>observability</em>, <em>event-driven systems</em>, and also <em>ai</em> is okay too i guess.
        </h2>

        <div class="bio-meta">
          <div class="meta-block">
            <div class="meta-label">currently</div>
            <div class="meta-value">
              Founding Engineer<br />
              <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">@langwatch</a>
            </div>
          </div>
          <div class="meta-block">
            <div class="meta-label">based</div>
            <div class="meta-value">Amsterdam, NL</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">stack</div>
            <div class="meta-value">TypeScript · React · Go · Claude (lol) · Postgres · MongoDB · ClickHouse</div>
          </div>
        </div>

        <div class="bio-find-me">
          <div class="bio-section-label">find me online</div>
          <${dt} />
        </div>
      </div>

      <div class="bio-sections">
        <div class="bio-section">
          <div class="bio-section-label">eng stuff @ work:</div>
          <ul class="bio-list">
            <li>working on the
              <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">@langwatch/platform</a>
              🏰</li>
            <li>working on the
              <a href="https://github.com/langwatch" target="_blank" rel="noopener noreferrer">@langwatch open source sdk's</a>
              (typescript 💻, python 🐍, go ⚡)</li>
          </ul>
        </div>

        <div class="bio-section">
          <div class="bio-section-label">eng stuff not @ work i'm not bored of:</div>
          <ul class="bio-list">
            <li>a 💅 stylish 💅 local and mutli-model AI assistant over at
              <a href="https://github.com/0xdeafcafe/bloefish" target="_blank" rel="noopener noreferrer">0xdeafcafe/bloefish</a>
            </li>
            <li>a chirpy 🐦 and feathery 🪶 API crafting tool over at
              <a href="https://github.com/getbeak/beak" target="_blank" rel="noopener noreferrer">getbeak/beak</a>
            </li>
          </ul>
        </div>

        <div class="bio-section">
          <div class="bio-section-label">when not @ work:</div>
          <p class="bio-emoji">
            🥳 ·
            <a href="/projects" class="bio-emoji-link" aria-label="Projects">🧑‍💻</a> ·
            🧑‍🍳 ·
            <a href="/photography" class="bio-emoji-link" aria-label="Photography">📷</a> ·
            <a href="/music" class="bio-emoji-link" aria-label="Music">🎶</a> ·
            <a href="/words" class="bio-emoji-link" aria-label="Words">✏️</a>
          </p>
        </div>
      </div>
    </${b}>
  `}function Ae({album:t,index:e=0}){let r=t.url?"a":"div",o=t.url?{href:t.url,target:"_blank",rel:"noopener noreferrer"}:{},a="album"+(t.large?" large":"")+(t.coverUrl?" has-art":"");return l`
    <${r}
      ...${o}
      class=${a}
      style=${`--c1: ${t.c1||""}; --c2: ${t.c2||""}; animation-delay: ${e*28}ms`}
      data-album-key=${ut(t)}
    >
      ${t.coverUrl?l`<img class="album-art" src=${t.coverUrl} alt=${`${t.artist} \u2014 ${t.name}`} loading="lazy" />`:null}
      <div class="album-mono">${P(t.artist)}</div>
      <div class="album-overlay">
        <div class="album-year">${t.year??""}</div>
        <div class="album-info">
          <div class="album-artist">${t.artist}</div>
          <div class="album-name">${t.name}</div>
        </div>
      </div>
    </${r}>
  `}function Te({artist:t,index:e=0}){let r=t.url?"a":"div",o=t.url?{href:t.url,target:"_blank",rel:"noopener noreferrer"}:{},a="artist-tile"+(t.image?" has-art":""),n=x(t.name);return l`
    <${r}
      ...${o}
      class=${a}
      style=${`--c1: ${n.c1}; --c2: ${n.c2}; animation-delay: ${e*35}ms`}
    >
      ${t.image?l`<img src=${t.image} alt=${t.name} loading="lazy" />`:null}
      <div class="artist-mono">${P(t.name)}</div>
      <div class="artist-body">
        <div class="artist-pos">#${t.position??e+1}</div>
        <div class="artist-name">${t.name.toLowerCase()}</div>
        <div class="artist-meta">
          ${t.followers?`${pt(t.followers)} followers`:"top artist"}
        </div>
      </div>
    </${r}>
  `}function Ce({url:t,title:e,subtitle:r,coverUrl:o,timestamp:a,paletteSeed:n,index:i=0}){let p=x(n),u=t?"a":"div";return l`
    <${u} ...${t?{href:t,target:"_blank",rel:"noopener noreferrer"}:{}} class="recent-row" style=${`animation-delay: ${i*20}ms`}>
      <div class="recent-art" style=${`background: linear-gradient(135deg, ${p.c1}, ${p.c2});`}>
        ${o?l`<img src=${o} alt="" loading="lazy" />`:null}
      </div>
      <div class="recent-info">
        <div class="recent-track">${e}</div>
        <div class="recent-artist">${r}</div>
      </div>
      <div class="recent-time" data-end=${a||""}>${L(a)}</div>
    </${u}>
  `}function Vt({url:t,song:e,artist:r,album:o,coverUrl:a,timestamp:n,rightLabel:i,paletteSeed:p,index:u=0}){let c=x(p),m=t?"a":"div",s=t?{href:t,target:"_blank",rel:"noopener noreferrer"}:{},d=n?l`<span class="track-right" data-end=${n}>${L(n)}</span>`:l`<span class="track-right">${i??""}</span>`;return l`
    <${m} ...${s} class="track-row" style=${`animation-delay: ${u*16}ms`}>
      <div class="track-art" style=${`background: linear-gradient(135deg, ${c.c1}, ${c.c2});`}>
        ${a?l`<img src=${a} alt="" loading="lazy" />`:null}
      </div>
      <span class="track-song">${e}</span>
      <span class="track-artist">${r}</span>
      <span class="track-album">${o??""}</span>
      ${d}
    </${m}>
  `}var Ne=60;function _r({data:t}){return l`${t.albums.map((e,r)=>l`<${Ae} album=${e} index=${r} />`)}`}function Ee(t,e){return e<=0?0:Math.pow(t/e,.55)}function fr({data:t}){let e=t.statsfmDateStats?.hours??{},r=Array.from({length:24},(a,n)=>e[String(n)]?.count??0),o=Math.max(1,...r);return l`${r.map((a,n)=>l`
    <span class="bar" style=${`--v: ${Ee(a,o).toFixed(3)}`} title=${`${n}:00 \xB7 ${a} streams`} />
  `)}`}var vr=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function hr({data:t}){let e=t.statsfmDateStats?.weekDays??{},r=Array.from({length:7},(a,n)=>e[String(n+1)]?.count??0),o=Math.max(1,...r);return l`${r.map((a,n)=>l`
    <span class="bar" style=${`--v: ${Ee(a,o).toFixed(3)}`} title=${`${vr[n]} \xB7 ${a} streams`} />
  `)}`}function gr({data:t}){let e=(t.topGenres??[]).slice(0,6);if(!e.length)return l``;let r=e.map((a,n)=>1-n*.13),o=r.reduce((a,n)=>a+n,0);return l`${e.map((a,n)=>{let i=Math.round(r[n]/o*100);return l`
      <div class="genre-row">
        <span class="genre-tag">${a.tag}</span>
        <span class="genre-pct">${i}%</span>
        <span class="genre-bar"><span class="genre-bar-fill" style=${`--w: ${i}%`} /></span>
      </div>
    `})}`}function br({data:t}){let[e,r]=w("lastyear"),o=e==="lifetime"?t.topArtistsLifetime:t.topArtistsLastYear;return l`
    <div id="music-artists-section" class="music-section">
      <h2 class="section-label-big">top artists</h2>
      <div class="pivot-tabs" role="tablist" aria-label="top artists range">
        <button class=${`pivot-tab${e==="lifetime"?" is-active":""}`} type="button" role="tab"
          aria-selected=${e==="lifetime"?"true":"false"}
          onClick=${()=>r("lifetime")}>lifetime</button>
        <button class=${`pivot-tab${e==="lastyear"?" is-active":""}`} type="button" role="tab"
          aria-selected=${e==="lastyear"?"true":"false"}
          onClick=${()=>r("lastyear")}>last year</button>
      </div>
      <div class="artists-strip">
        ${o.slice(0,12).map((a,n)=>l`<${Te} artist=${a} index=${n} />`)}
      </div>
    </div>
  `}function Ve(t,e){if(e&&e.toLowerCase()!==t.toLowerCase())return e}function $r({data:t}){let[e,r]=w("recent"),o=e==="recent"?t.recentlyPlayed.slice(0,14).map((a,n)=>l`
        <${Vt}
          url=${a.url}
          song=${a.name}
          artist=${a.artist}
          album=${Ve(a.name,a.album)}
          coverUrl=${a.coverUrl}
          timestamp=${a.endTime}
          paletteSeed=${`${a.artist}::${a.album||a.name}`}
          index=${n}
        />
      `):t.topTracks.slice(0,14).map((a,n)=>l`
        <${Vt}
          url=${a.url}
          song=${a.name}
          artist=${a.artist}
          album=${Ve(a.name,a.album)}
          coverUrl=${a.coverUrl}
          rightLabel=${`#${a.position}`}
          paletteSeed=${`${a.artist}::${a.album||a.name}`}
          index=${n}
        />
      `);return l`
    <div id="music-feed-section" class="music-section">
      <h2 class="section-label-big">the feed</h2>
      <div class="pivot-tabs" role="tablist" aria-label="feed range">
        <button class=${`pivot-tab${e==="recent"?" is-active":""}`} type="button" role="tab"
          aria-selected=${e==="recent"?"true":"false"}
          onClick=${()=>r("recent")}>recent</button>
        <button class=${`pivot-tab${e==="tracks"?" is-active":""}`} type="button" role="tab"
          aria-selected=${e==="tracks"?"true":"false"}
          onClick=${()=>r("tracks")}>top · past 4 weeks</button>
      </div>
      <div class="feed-table-head">
        <span></span><span>song</span><span>artist</span><span>album</span>
        <span class="feed-right">when</span>
      </div>
      <div class="feed-table">${o}</div>
    </div>
  `}function yr({data:t}){let e=t.soundcloudUser;return!(t.soundcloud?.likes??[]).length||!e?null:l`live from <a href=${`https://soundcloud.com/${e}/likes`} target="_blank" rel="noopener noreferrer">soundcloud.com/${e}</a>`}function kr({data:t}){let e=t.soundcloud?.likes??[],r=e.length,[o,a]=w(!1),n=e.slice(0,o?r:Math.min(r,Ne));return l`
    <div id="music-soundcloud-section" class="music-section">
      <h2 class="section-label-big">soundcloud likes</h2>
      <div class="snapshot-meta snapshot-meta-row"><${yr} data=${t} /></div>
      <div class="recent-feed">
        ${n.map((i,p)=>{let u=[i.artist];return i.uploader&&u.push(`@${i.uploader}`),i.genre&&u.push(i.genre),l`
            <${Ce}
              url=${i.url}
              title=${i.title}
              subtitle=${u.join(" \xB7 ")}
              coverUrl=${i.artworkUrl}
              timestamp=${i.likedAt}
              paletteSeed=${`${i.artist}::${i.title}`}
              index=${p}
            />
          `})}
      </div>
      ${r>Ne&&!o?l`
        <button type="button" class="recent-feed-more" onClick=${()=>a(!0)}>
          show all ${r}
        </button>
      `:null}
    </div>
  `}function Me({data:t}){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">music</div>
      <h2 class="section-label-big">in rotation</h2>

      <div class="music-stats-row">
        <div class="music-mosaic"><${_r} data=${t} /></div>
        <aside class="stats-rail" aria-label="listening pattern">
          <section class="stat-block">
            <h3 class="stat-label">pattern</h3>
            <div class="stat-sub">hourly</div>
            <div class="pattern-bars pattern-bars-24"><${fr} data=${t} /></div>
            <div class="pattern-axis pattern-axis-24"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
            <div class="stat-sub">weekday</div>
            <div class="pattern-bars pattern-bars-7"><${hr} data=${t} /></div>
            <div class="pattern-axis pattern-axis-7"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
          </section>
          <section class="stat-block">
            <h3 class="stat-label">top genres</h3>
            <div class="genre-list"><${gr} data=${t} /></div>
          </section>
        </aside>
      </div>

      <${br} data=${t} />
      <${$r} data=${t} />
      <${kr} data=${t} />
    </${b}>
  `}var De=["purple","orange","green","red","blue","brown","teal","pink"],wr={TypeScript:"#3178c6",JavaScript:"#f1e05a",Go:"#00add8",Python:"#3572a5",Rust:"#dea584",Swift:"#f05138",Java:"#b07219",Kotlin:"#a97bff","C#":"#178600","C++":"#f34b7d",C:"#555555",Ruby:"#701516",PHP:"#4f5d95",HTML:"#e34c26",CSS:"#563d7c",Shell:"#89e051",Lua:"#000080",Vue:"#41b883",Svelte:"#ff3e00",Elixir:"#6e4a7e",Haskell:"#5e5086"};function Sr(t){return t&&wr[t]||"#888"}function Pr(t){if(!t)return null;let e=[];return t.language&&e.push(l`
      <span class="project-stat">
        <span class="project-lang-dot" style=${`background: ${Sr(t.language)};`} />
        ${t.language}
      </span>
    `),t.stars>=1&&e.push(l`
      <span class="project-stat">
        <i data-lucide="star" class="project-stat-icon" />
        ${Nt(t.stars)}
      </span>
    `),t.forks>=1&&e.push(l`
      <span class="project-stat">
        <i data-lucide="git-fork" class="project-stat-icon" />
        ${Nt(t.forks)}
      </span>
    `),t.pushedAt&&e.push(l`
      <span class="project-stat project-stat-time" title="Last pushed">
        ${L(t.pushedAt)}
      </span>
    `),t.archived&&e.push(l`<span class="project-stat project-stat-archived">archived</span>`),e.length?l`<div class="project-stats">${e}</div>`:null}function Le({project:t,index:e=0}){let r=t.github?.description||t.desc;return l`
    <a
      class="project-card"
      href=${t.url}
      target="_blank"
      rel="noopener noreferrer"
      data-tone=${De[e%De.length]}
      style=${`animation-delay: ${e*35}ms`}
    >
      <span class="project-tag"><i data-lucide=${t.icon} />${t.tag}</span>
      <h3 class="project-name">${t.name}</h3>
      <p class="project-desc">${r}</p>
      ${Pr(t.github)}
      <span class="project-arrow"><i data-lucide="arrow-up-right" /></span>
    </a>
  `}function je({data:t}){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">projects</div>
      <h2 class="section-label-big">open source</h2>
      <div class="projects-grid">
        ${t.projects.map((e,r)=>l`<${Le} project=${e} index=${r} />`)}
      </div>
    </${b}>
  `}function Ue({word:t}){return l`
    <a class="word-card" href=${t.url} target="_blank" rel="noopener noreferrer">
      <div class="word-source">${t.source}</div>
      <h3 class="word-title">${t.title}</h3>
      <span class="word-cta">read piece <i data-lucide="arrow-right" /></span>
    </a>
  `}function Fe({data:t}){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">words</div>
      <h2 class="section-label-big">writing</h2>
      <div class="words-grid">
        ${t.words.map(e=>l`<${Ue} word=${e} />`)}
      </div>
    </${b}>
  `}function Re({photo:t,index:e=0}){let r=["photo-tile"];t.large?r.push("large"):t.tall?r.push("tall"):t.wide&&r.push("wide");let o=t.instagramUrl?"a":"div",a=t.instagramUrl?{href:t.instagramUrl,target:"_blank",rel:"noopener noreferrer"}:{};return l`
    <${o} ...${a} class=${r.join(" ")} style=${`animation-delay: ${e*30}ms`}>
      <img src=${t.url} alt=${t.title||""} loading="lazy" />
      <div class="photo-meta">
        <div class="photo-title">${t.title||""}</div>
        <div class="photo-loc">${t.loc||""}</div>
      </div>
    </${o}>
  `}function xr({data:t}){if(!t.instagramUser||!t.photos.length)return null;let e=t.instagramUser;return l`${t.photos.length} frames · live from <a href=${`https://www.instagram.com/${e}`} target="_blank" rel="noopener noreferrer">@${e}</a>`}function Ie({data:t}){return l`
    <${b}>
      <div class="page-watermark" aria-hidden="true">photography</div>
      <div class="music-header">
        <h2 class="section-label-big">selected frames</h2>
        <div class="snapshot-meta"><${xr} data=${t} /></div>
      </div>
      <div class="photo-mosaic">
        ${t.photos.map((e,r)=>l`<${Re} photo=${e} index=${r} />`)}
      </div>
    </${b}>
  `}function A({name:t,children:e}){let{pivot:r}=C(),o=r===t;return l`
    <section class=${`pivot-page${o?" active":""}`} data-page=${t} role="tabpanel">
      ${o?e:null}
    </section>
  `}function Ar({data:t}){let{pivot:e}=C();return me(),_e(),S(()=>{window.lucide?.createIcons()},[e]),l`
    <main class="pivot-pages">
      <${A} name="quickplay"><${Pe} data=${t} /></${A}>
      <${A} name="collection"><${xe} /></${A}>
      <${A} name="music"><${Me} data=${t} /></${A}>
      <${A} name="projects"><${je} data=${t} /></${A}>
      <${A} name="words"><${Fe} data=${t} /></${A}>
      <${A} name="photography"><${Ie} data=${t} /></${A}>
    </main>
  `}function He({data:t,initialPivot:e}){let r=ue(e),o=de();return l`
    <${lt.Provider} value=${r}>
      <${ct.Provider} value=${o}>
        <${fe} />
        <${ge} data=${t} />
        <div class="vignette" aria-hidden="true"></div>
        <div class="grain" aria-hidden="true"></div>
        <div class="app">
          <${be} />
          <${$e} />
          <${Ar} data=${t} />
        </div>
        <${ke} data=${t} />
      </${ct.Provider}>
    </${lt.Provider}>
  `}var We=document.getElementById("root");if(!We)throw new Error("[client] missing #root");wt(l`<${He} data=${Tr} />`,We);
//# sourceMappingURL=client.js.map
