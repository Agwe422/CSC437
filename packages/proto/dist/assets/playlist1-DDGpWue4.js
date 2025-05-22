import{f as v,u as m,i as f,a as y,x as u}from"./darkmode-Du2TWbuW.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const b=t=>(r,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,r)}):customElements.define(t,r)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const P={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:v},_=(t=P,r,s)=>{const{kind:o,metadata:e}=s;let n=globalThis.litPropertyMetadata.get(e);if(n===void 0&&globalThis.litPropertyMetadata.set(e,n=new Map),o==="setter"&&((t=Object.create(t)).wrapped=!0),n.set(s.name,t),o==="accessor"){const{name:a}=s;return{set(i){const d=r.get.call(this);r.set.call(this,i),this.requestUpdate(a,d,t)},init(i){return i!==void 0&&this.C(a,void 0,t,i),i}}}if(o==="setter"){const{name:a}=s;return function(i){const d=this[a];r.call(this,i),this.requestUpdate(a,d,t)}}throw Error("Unsupported decorator location: "+o)};function p(t){return(r,s)=>typeof s=="object"?_(t,r,s):((o,e,n)=>{const a=e.hasOwnProperty(n);return e.constructor.createProperty(n,o),a?Object.getOwnPropertyDescriptor(e,n):void 0})(t,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function w(t){return p({...t,state:!0,attribute:!1})}var O=Object.defineProperty,$=Object.getOwnPropertyDescriptor,h=(t,r,s,o)=>{for(var e=o>1?void 0:o?$(r,s):r,n=t.length-1,a;n>=0;n--)(a=t[n])&&(e=(o?a(r,s,e):a(e))||e);return o&&e&&O(r,s,e),e};let l=class extends y{constructor(){super(...arguments),this.title="",this.duration=""}render(){return u`
      <td class="title">${this.title}</td>
      <td class="duration">${this.duration}</td>
    `}};l.styles=f`
    :host { display: table-row; }
    td { padding: var(--spacing-xxs) var(--spacing-md); }
    .title    { text-align: left; }
    .duration { text-align: right; }
  `;h([p({type:String})],l.prototype,"title",2);h([p({type:String})],l.prototype,"duration",2);l=h([b("playlist-song")],l);var j=Object.defineProperty,x=Object.getOwnPropertyDescriptor,g=(t,r,s,o)=>{for(var e=o>1?void 0:o?x(r,s):r,n=t.length-1,a;n>=0;n--)(a=t[n])&&(e=(o?a(r,s,e):a(e))||e);return o&&e&&j(r,s,e),e};let c=class extends y{constructor(){super(...arguments),this.src="",this.songs=[]}connectedCallback(){super.connectedCallback(),this.src&&this._fetchSongs()}async _fetchSongs(){try{const t=await fetch(this.src);this.songs=await t.json()}catch(t){console.error("Failed to load songs:",t)}}render(){return u`
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${this.songs.map(t=>u`
            <playlist-song
              title=${t.title}
              duration=${t.duration}>
            </playlist-song>
          `)}
        </tbody>
      </table>
    `}};c.styles=f`
    :host { display: block; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid var(--color-border); }
  `;g([p({type:String})],c.prototype,"src",2);g([w()],c.prototype,"songs",2);c=g([b("playlist-song-list")],c);
