
/* ===== Helpers ===== */
const TPL = {"beh":{"Sin":{"properties":{"movement":"size","wave":"sine","period":1,"period-random":0,"period-offset":0,"period-offset-random":0,"magnitude":10,"magnitude-random":0,"enabled":true,"live-preview":false}},"Fade":{"properties":{"fade-in-time":0,"wait-time":0,"fade-out-time":1,"destroy":true,"enabled":false,"live-preview":false}},"Pin":{"properties":{"destroy":false}},"Flash":{"properties":{}},"solid":{"properties":{"enabled":true,"use-instance-tags":false,"tags":""}},"Rotate":{"properties":{"speed":45,"acceleration":0,"rotation-type":"2d","enabled":true,"live-preview":false}},"Platform":{"properties":{"max-speed":0,"acceleration":0,"deceleration":0,"jump-strength":1200,"gravity":1300,"max-fall-speed":1000,"double-jump":true,"jump-sustain":0,"default-controls":false,"enabled":true}},"scrollto":{"properties":{"enabled":true}}},"inst":{"TiledBg":{"initially-visible":true,"origin":"top-left","wrap-horizontal":"repeat","wrap-vertical":"repeat","image-offset-x":0,"image-offset-y":0,"image-scale-x":1,"image-scale-y":1,"image-angle":0,"enable-tile-randomization":false,"x-random":1,"y-random":1,"angle-random":1,"blend-margin-x":0.1,"blend-margin-y":0.1},"Sprite":{"initially-visible":true,"initial-animation":"Default","initial-frame":5,"enable-collisions":true,"live-preview":false},"Spritefont2":{"text":"LOADING - 100%","enable-bbcode":false,"character-width":128,"character-height":128,"character-set":"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;?!-+=~&$%()\\/{}[]<>^*▲▼@","spacing-data":"","scale":0.75,"character-spacing":-50,"line-height":0,"horizontal-alignment":"center","vertical-alignment":"center","wrapping":"word","initially-visible":true,"origin":"center","read-aloud":false},"NinePatch":{"left-margin":8,"right-margin":8,"top-margin":8,"bottom-margin":8,"edges":"stretch","fill":"stretch","image-scale-x":1,"image-scale-y":1,"initially-visible":true,"origin":"left","seams":"overlap"}},"single":{"LocalStorage":{"in-memory-only":false},"Touch":{"use-mouse-input":true},"Mouse":{},"Keyboard":{},"Audio":{"timescale-audio":"off","save-load":"all","play-in-background":false,"latency-hint":"interactive","enable-multiple-tags":false,"panning-model":"hrtf","distance-model":"inverse","listener-z-height":600,"reference-distance":600,"maximum-distance":10000,"roll-off-factor":1},"Browser":{}},"proj":{"description":"City Hero","version":"1.0.0","autoIncrementVersion":false,"author":"Bnagames","authorEmail":"matijabna@gmail.com","authorWebsite":"http://bnagames.com","appId":"com.bnagames.cityhero","saveLLMContextFile":true,"pixelRounding":false,"fov":0.7853981633974483,"useLoaderLayout":true,"fullscreenMode":"letterbox-scale","fullscreenQuality":"high","viewportFit":"auto","backgroundColor":[0,0,0,0],"splashColor":[1,1,1,0],"useThemeColor":false,"themeColor":[1,1,1,0],"orientations":"any","webgpu":"auto","multitexturing":"auto","gpuPreference":"high-performance","framerateMode":"vsync","fixedFramerate":30,"sampling":"trilinear","downscaling":"medium","renderingMode":"auto","anisotropicFiltering":"auto","zNear":10,"zFar":100000,"maxSpriteSheetSize":2048,"loaderStyle":"none","preloadSounds":true,"uidAllocationMode":"increment","zAxisScale":"regular","cordovaiOSScheme":"app","cordovaAndroidScheme":"https","exportFileStructure":"folders","scriptsType":"module"}};
const kids = (e, t) => e ? [...e.children].filter(c => !t || c.tagName === t) : [];
const kid = (e, t) => kids(e, t)[0];
const txt = e => e ? (e.textContent || '').trim() : '';
const val = (e, t) => txt(kid(e, t));
const nm = e => e.getAttribute('name') || txt(e);
const kebab = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const N = v => Number(v);
const safe = s => String(s).replace(/[\\/:*?"<>|]/g, '_');
const J = o => JSON.stringify(o, null, '\t');
const BS = (...p) => p.filter(Boolean).join('/');
const RAW_KEYS = ['text', 'character-set', 'initial-animation', 'tags', 'spacing-data'];
const SINGLETONS = ['Audio', 'Browser', 'Keyboard', 'Mouse', 'Touch', 'LocalStorage', 'Gamepad'];
const PLUGIN_MAP = { WebStorage: 'LocalStorage' };

/* C2 name -> C3 id where it differs from kebab-case(name). Key: "kind|scope|lowercase name" (scope * = any object) */
const ID_OVR = {
  'a|System|set value': 'set-eventvar-value', 'a|*|set value': 'set-instvar-value',
  'a|System|add to': 'add-to-eventvar', 'a|*|add to': 'add-to-instvar',
  'a|System|subtract from': 'subtract-from-eventvar', 'a|*|subtract from': 'subtract-from-instvar',
  'c|System|compare variable': 'compare-eventvar', 'c|System|compare opacity': 'compare-layer-opacity',
  'a|*|set frame': 'set-animation-frame', 'a|*|set speed': 'set-animation-speed', 'a|*|start': 'start-animation',
  'a|*|stop': 'stop-animation', 'a|*|set boolean': 'set-boolean-instvar', 'a|*|toggle boolean': 'toggle-boolean-instvar',
  'c|*|compare frame': 'compare-animation-frame', 'c|*|compare speed': 'compare-animation-speed',
  'c|*|on finished': 'on-animation-finished', 'c|*|on any finished': 'on-any-animation-finished',
  'c|*|is playing': 'is-animation-playing', 'c|*|is boolean instance variable set': 'is-boolean-instance-variable-set',
  'a|WebStorage|set local value': 'set-item'
};
/* Enumerated parameters: C2 numeric index -> C3 string */
const ENUM = {
  'mouse-button': ['left', 'middle', 'right'], from: ['current-frame', 'beginning'], visibility: ['invisible', 'visible'],
  loop: ['not-looping', 'looping'], control: ['left', 'right', 'jump'], mode: ['position-angle', 'position-only', 'angle-only'],
  'set-boolean-instvar:value': ['false', 'true', 'toggle'], 'set-group-active:state': ['deactivated', 'activated', 'toggle'],
  'set-active:state': ['inactive', 'active'], state: ['disabled', 'enabled', 'toggle']
};
const EXTRA = {
  'on-touched-object': { type: 'start' }, play: { 'stereo-pan': '0' }, 'request-fullscreen': { 'navigation-ui': 'auto' },
  wait: { 'use-timescale': true }, 'spawn-another-object': { 'create-hierarchy': false, 'template-name': '""' },
  'create-object': { 'create-hierarchy': false, 'template-name': '""' }
};
const FS_MODES = { 3: 'stretch-letterbox-scale' };

/* Convert a C2 property (XML text) to a C3 property value */
function cprop(key, t) {
  if (RAW_KEYS.includes(key)) return t;
  if (/^(visible|enabled|yes|on|active|after fade out)$/i.test(t)) return true;
  if (/^(invisible|disabled|no|off|inactive|do not destroy)$/i.test(t)) return false;
  if (t !== '' && !isNaN(t)) return Number(t);
  return t.toLowerCase().replace(/\s+/g, '-');
}
const PKEY = { 'initial-visibility': 'initially-visible', collisions: 'enable-collisions', hotspot: 'origin',
  'active-at-start': 'enabled', 'active-on-start': 'enabled', 'initial-state': 'enabled' };
const props = (el, base) => {
  const o = JSON.parse(JSON.stringify(base || {}));
  kids(kid(el, 'properties')).forEach(p => { const k = PKEY[p.tagName] || p.tagName; o[k] = cprop(k, txt(p)); });
  return o;
};
const pngSize = b => ({ w: ((b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]) >>> 0, h: ((b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]) >>> 0 });

/* ===== Converter ===== */
async function convert(src, log) {
  const st = { sid: 1e15, warn: 0, storage: false, ids: new Set() };
  const nsid = () => ++st.sid;
  const wf = (i, info) => wfx('step', i, info);   // workflow visualizer hook
  const warn = m => { st.warn++; log('warn', m); };
  const spriteId = () => { let n; do n = 100000 + Math.floor(Math.random() * 9e6); while (st.ids.has(n)); st.ids.add(n); return n; };
  const files = Object.entries(src.files).filter(([, f]) => !f.dir).map(([p, f]) => ({ p: p.replace(/\\/g, '/'), f }));
  const find = re => files.filter(x => re.test(x.p));
  const byLower = {}; files.forEach(x => byLower[x.p.toLowerCase()] = x);
  const xml = async x => {
    const d = new DOMParser().parseFromString((await x.f.async('text')).replace(/^\uFEFF/, ''), 'application/xml');
    if (d.querySelector('parsererror')) throw new Error('Invalid XML in ' + x.p);
    return d.documentElement;
  };
  await wf(1, { files: files.length });
  const cap = find(/^[^/]+\.caproj$/i)[0] || find(/\.caproj$/i)[0];
  if (!cap) throw new Error('No .caproj file found. This does not look like a Construct 2 .capx archive.');
  log('info', 'Project file: ' + cap.p);
  const P = await xml(cap);

  /* ---- Addons ---- */
  await wf(2);
  const addons = [];
  const add = (type, id, name, author) => { if (!addons.some(a => a.type === type && a.id === id)) addons.push({ type, id, name: name || id, author: author || 'Scirra', bundled: false }); };
  [['used-plugins', 'plugin'], ['used-behaviors', 'behavior'], ['used-effects', 'effect']].forEach(([sel, type]) => {
    kids(kid(P, sel)).forEach(e => {
      const id = e.getAttribute('id'); if (!id) return;
      if (id === 'WebStorage') { st.storage = true; add('plugin', 'LocalStorage', 'Local storage'); log('info', 'WebStorage plugin replaced by LocalStorage'); }
      else add(type, id, txt(e), (e.getAttribute('author') || 'Scirra').split('/').pop());
    });
  });

  /* ---- Families and object types ---- */
  await wf(3, { addons: addons.length });
  const famOf = {};            // object name -> [family elements]
  const families = kids(kid(P, 'families'), 'family');
  families.forEach(f => kids(kid(f, 'members'), 'member').forEach(m => (famOf[txt(m)] ||= []).push(f)));
  const ivars = el => kids(kid(el, 'instance-variables'), 'instance-variable').map(v => ({ name: v.getAttribute('name'), type: (v.getAttribute('type') || 'number').replace('text', 'string'), desc: '', show: true, sid: N(v.getAttribute('sid') || nsid()) }));
  const bts = el => kids(kid(el, 'behaviors'), 'behavior-type').map(b => ({ behaviorId: kid(b, 'behavior')?.getAttribute('id') || nm(b), name: b.getAttribute('name'), sid: N(b.getAttribute('sid') || nsid()) }));
  const fxs = el => kids(kid(el, 'effects'), 'effect-type').map(e => ({ effectId: kid(e, 'effect')?.getAttribute('id') || nm(e), name: e.getAttribute('name') }));

  const objs = {}, pathOf = {};
  const tree = (el, path) => {
    const items = [], subfolders = [];
    kids(el).forEach(c => {
      if (c.tagName === 'object-type') {
        const n = c.getAttribute('name'); objs[n] = c; pathOf[n] = path;
        items.push(n === 'WebStorage' ? 'LocalStorage' : n);
      } else if (c.tagName === 'object-folder') { const fn = c.getAttribute('name') || 'Folder'; subfolders.push({ items: [], subfolders: [], ...tree(c, BS(path, fn)), name: fn }); }
    });
    return { items, subfolders };
  };
  const rootFolder = kids(P).find(c => c.tagName === 'object-folder');
  const otTree = rootFolder ? tree(rootFolder, '') : { items: [], subfolders: [] };

  const plugOf = n => PLUGIN_MAP[kid(objs[n], 'plugin')?.getAttribute('id')] || kid(objs[n], 'plugin')?.getAttribute('id') || 'Sprite';
  const varTypes = n => { const t = {}; [...(famOf[n] || []), objs[n]].filter(Boolean).forEach(e => ivars(e).forEach(v => t[v.name] = v.type)); return t; };
  const behId = n => { const t = {}; [...(famOf[n] || []), objs[n]].filter(Boolean).forEach(e => bts(e).forEach(b => t[b.name] = b.behaviorId)); return t; };

  /* ---- Images ---- */
  await wf(4, { objects: Object.keys(objs).length });
  const img = {};
  for (const x of find(/\.png$/i)) { const b = new Uint8Array(await x.f.async('uint8array')); img[x.p.toLowerCase()] = { b, ...pngSize(b), p: x.p }; }
  const outImages = {};
  const spriteName = (o, a, i) => (o + '-' + a + '-' + String(i).padStart(3, '0') + '.png').toLowerCase();

  /* ---- Layouts ---- */
  await wf(5, { images: Object.keys(img).length });
  const layouts = {}; let maxUid = 0;
  for (const x of find(/(^|\/)layouts\/[^/]+\.xml$/i)) {
    if (/\.uistate\.xml$/i.test(x.p)) continue;
    const r = await xml(x), name = val(r, 'name') || x.p.split('/').pop().replace(/\.xml$/i, '');
    const num = (e, k, d = 0) => { const v = parseFloat(val(e, k)); return isNaN(v) ? d : v; };
    const layers = kids(kid(r, 'layers'), 'layer').map(l => {
      const par = kid(l, 'parallax'), bg = (val(l, 'background-color') || '0,0,0').split(',').map(v => N(v) / 255);
      const L = { name: l.getAttribute('name'), overriden: 0, subLayers: [], instances: [], sid: N(l.getAttribute('sid') || nsid()), effectTypes: [],
        isInitiallyVisible: val(l, 'initially-visible') !== '0', isInitiallyInteractive: true, isHTMLElementsLayer: false, color: [1, 1, 1, 1],
        backgroundColor: [...bg, 1], isTransparent: val(l, 'transparent') !== '0', sampling: 'auto', parallaxX: num(par, 'x', 1), parallaxY: num(par, 'y', 1),
        scaleRate: num(l, 'zoom-rate', 1), forceOwnTexture: val(l, 'force-own-texture') === '1', renderingMode: '3d', drawOrder: 'z-order',
        useRenderCells: val(l, 'use-render-cells') === '1', blendMode: 'normal', zElevation: 0, global: val(l, 'global') === '1' };
      kids(kid(l, 'instances'), 'instance').forEach(i => {
        const t = i.getAttribute('type'); if (!objs[t]) return;
        const plug = plugOf(t); if (SINGLETONS.includes(plug)) return;
        const uid = N(i.getAttribute('uid')); maxUid = Math.max(maxUid, uid);
        const w = kid(i, 'world'), vt = varTypes(t), ids = behId(t);
        const iv = {}; kids(kid(i, 'instance-variables')).forEach(v => { const s = txt(v), ty = vt[v.tagName];
          iv[v.tagName] = ty === 'boolean' ? (s === '1' || s === 'true') : ty === 'string' ? s : Number(s); });
        const beh = {}; kids(kid(i, 'behavior-instances'), 'behavior-instance').forEach(b => {
          const bn = b.getAttribute('type'), id = ids[bn] || bn;
          const base = TPL.beh[id]; if (!base) { warn('No default properties known for behavior "' + id + '" (' + t + ')'); beh[bn] = { properties: props(b) }; return; }
          const p = props(b, base.properties);
          beh[bn] = { properties: p };
        });
        const ip = props(i, TPL.inst[plug] || {}); if (plug === 'Sprite') { const an = kids(kid(objs[t], 'animation-folder'), 'animation').map(x => x.getAttribute('name')); if (an.length && !an.includes(ip['initial-animation'])) ip['initial-animation'] = an[0]; }
        const fx = {}; kids(kid(i, 'effect-instances'), 'effect-instance').forEach(e => { const pr = {}; kids(kid(e, 'parameters')).forEach(q => pr[q.tagName] = Number(txt(q))); fx[e.getAttribute('type')] = { isEnabled: true, parameters: pr }; });
        L.instances.push({ type: t, properties: ip, uid, sid: nsid(), tags: '', instanceVariables: iv, behaviors: beh,
          materialSurfaceType: 'smooth', showing: true, locked: false, ...(Object.keys(fx).length ? { effects: fx } : {}),
          world: { x: num(w, 'x'), y: num(w, 'y'), width: num(w, 'width'), height: num(w, 'height'), originX: num(w, 'hotspotX'), originY: num(w, 'hotspotY'),
            color: [1, 1, 1, num(w, 'opacity', 1)], z: num(w, 'z'), angle: num(w, 'angle') } });
      });
      return L;
    });
    layouts[name] = { name, layers, sid: N(val(r, 'sid') || nsid()), 'nonworld-instances': [], effectTypes: [], width: num(kid(r, 'size'), 'width', 1920), height: num(kid(r, 'size'), 'height', 1080),
      unboundedScrolling: val(r, 'unbounded-scrolling') === '1', sampling: 'auto', ambientLight: 0.03, vpX: 0.5, vpY: 0.5, projection: 'perspective', eventSheet: val(r, 'event-sheet') || null };
  }

  /* ---- Event sheets ---- */
  await wf(6, { layouts: Object.keys(layouts).length });
  const rw = (s, set) => {
    s = s.replace(/WebStorage\.(Local|Session)Value\(\s*("(?:[^"\\]|\\.)*")\s*\)/gi, (m, kind, key) => {
      if (/session/i.test(kind)) warn('SessionValue(' + key + ') mapped to LocalStorage (no session storage in Construct 3)');
      set.add(key); return 'LocalStorage.ItemValue';
    });
    if (/WebStorage\./.test(s)) warn('Unsupported WebStorage expression needs manual review: ' + s);
    return s;
  };
  const LS = (id, key) => ({ id, objectClass: 'LocalStorage', sid: nsid(), parameters: { key } });
  const op = (el, kind) => {
    const type = el.getAttribute('type') || 'System', name = el.getAttribute('name') || '', ln = name.toLowerCase();
    const rd = new Set(), ps = kids(el, 'param');
    const vals = ps.map(p => rw(txt(p), rd));
    const o = { id: '', objectClass: PLUGIN_MAP[type] || type, sid: N(el.getAttribute('sid') || nsid()) };
    if (type === 'WebStorage') {
      st.storage = true;
      if (/session/.test(ln)) warn('"' + name + '" uses session storage; mapped to LocalStorage');
      const key = vals[0] || '""', pr = { key };
      if (kind === 'c' && /exist/.test(ln)) o.id = 'on-item-exists';
      else if (kind === 'a' && /remov/.test(ln)) o.id = 'remove-item';
      else if (kind === 'a' && /clear/.test(ln)) o.id = 'clear-storage';
      else if (kind === 'a' && /set|store|save/.test(ln)) { o.id = 'set-item'; pr.value = vals[1] || '""'; }
      else { o.id = kebab(name); warn('WebStorage "' + name + '" has no known LocalStorage equivalent'); }
      if (o.id !== 'clear-storage') o.parameters = pr;
    } else {
      const scope = objSystem(type) ? type : '*';
      o.id = ID_OVR[kind + '|' + scope + '|' + ln] || kebab(name);
      if (!name) { o.id = 'unknown-' + el.getAttribute('id'); warn('Unnamed ' + (kind === 'c' ? 'condition' : 'action') + ' id ' + el.getAttribute('id') + ' on ' + type); }
      const pr = {};
      ps.forEach((p, i) => {
        const k = kebab(p.getAttribute('name') || 'param-' + i); let v = vals[i];
        if (k === 'comparison' || (k === 'key' && type === 'Keyboard')) v = Number(v);
        else if (k === 'audio-file') v = { path: v };
        else if (o.id === 'request-fullscreen' && k === 'mode') { v = FS_MODES[v] || (warn('Fullscreen mode ' + v + ' needs manual review'), 'letterbox-scale'); }
        else { const e = ENUM[o.id + ':' + k] || ENUM[k]; if (e && /^\d+$/.test(v) && e[+v] !== undefined) v = e[+v]; }
        pr[k] = v;
      });
      Object.assign(pr, EXTRA[o.id]);
      if (Object.keys(pr).length) o.parameters = pr;
    }
    if (el.getAttribute('behavior')) o.behaviorType = el.getAttribute('behavior');
    if (kind === 'c' && ['1', 'true'].includes(el.getAttribute('inverted'))) o.isInverted = true;
    return { o, rd };
  };
  const objSystem = t => ['System', 'Audio', 'Browser', 'Mouse', 'Keyboard', 'Touch', 'WebStorage'].includes(t);
  const block = (c, a, ch, sid, or) => { const b = { eventType: 'block', conditions: c, actions: a, sid: sid || nsid() }; if (or) b.isOrBlock = true; if (ch && ch.length) b.children = ch; return b; };
  const eventBlock = e => {
    const sid = N(e.getAttribute('sid') || nsid()), or = e.getAttribute('any') === '1';
    const c = []; let ex = null;
    kids(kid(e, 'conditions'), 'condition').forEach(x => { const { o } = op(x, 'c'); if (o.id === 'on-item-exists') ex = o; else c.push(o); });
    const plain = [], rds = []; let rkey = null;
    kids(kid(e, 'actions'), 'action').forEach(x => {
      const { o, rd } = op(x, 'a');
      if (rd.size) { rds.push(o); if (rd.size > 1 || (rkey && ![...rd].includes(rkey))) warn('Action "' + o.id + '" reads several storage keys; review manually'); rkey = rkey || [...rd][0]; }
      else plain.push(o);
    });
    const ch = events(kid(e, 'sub-events'));
    if (!ex && !rds.length) return [block(c, plain, ch, sid, or)];
    const out = []; let first, fsid;
    if (ex) { out.push(block(c, [LS('check-item-exists', ex.parameters.key)], [], sid, or)); first = [ex]; }
    else { first = c; fsid = sid; }
    if (rds.length) { out.push(block(first, [...plain, LS('get-item', rkey)], [], fsid, !ex && or)); out.push(block([LS('on-item-get', rkey)], rds, ch)); }
    else out.push(block(first, plain, ch, fsid, !ex && or));
    return out;
  };
  const events = parent => {
    const out = [];
    for (const e of kids(parent)) {
      switch (e.tagName) {
        case 'variable': out.push({ eventType: 'variable', name: e.getAttribute('name') || '', type: (e.getAttribute('type') || 'number').replace('text', 'string'), initialValue: txt(e) || '0',
          comment: e.getAttribute('comment') || '', isStatic: e.getAttribute('static') === '1', isConstant: e.getAttribute('constant') === '1', sid: N(e.getAttribute('sid') || nsid()) }); break;
        case 'include': out.push({ eventType: 'include', includeSheet: txt(e) }); break;
        case 'comment': out.push({ eventType: 'comment', text: txt(e) }); break;
        case 'event-group': case 'group': out.push({ eventType: 'group', disabled: e.getAttribute('disabled') === '1', title: e.getAttribute('title') || '', description: e.getAttribute('description') || '',
          isActiveOnStart: e.getAttribute('active-on-start') !== '0', children: events(e), sid: N(e.getAttribute('sid') || nsid()) }); break;
        case 'event-block': out.push(...eventBlock(e)); break;
        case 'events': case 'sub-events': out.push(...events(e));
      }
    }
    return out;
  };
  /* C3 forbids a trigger inside another event's branch: lift generated storage triggers to the top level (or group level) */
  const TRIG = new Set(['on-item-exists', 'on-item-get']);
  const isT = ev => ev.eventType === 'block' && (ev.conditions || []).some(k => TRIG.has(k.id));
  const hoist = list => {
    const res = [];
    for (const ev of list) {
      if (ev.eventType === 'group') { ev.children = hoist(ev.children || []); res.push(ev); continue; }
      const lifted = [];
      const strip = es => es.filter(c => {
        if (isT(c)) { lifted.push(c); return false; }
        if (c.children) { c.children = strip(c.children); if (!c.children.length) delete c.children; }
        return true;
      });
      if (ev.children) { ev.children = strip(ev.children); if (!ev.children.length) delete ev.children; }
      res.push(ev, ...hoist(lifted));
    }
    return res;
  };
  const sheets = {};
  for (const x of find(/(^|\/)event sheets\/[^/]+\.xml$/i)) {
    if (/\.uistate\.xml$/i.test(x.p)) continue;
    const r = await xml(x), name = x.p.split('/').pop().replace(/\.xml$/i, '');
    sheets[name] = { name, events: hoist(events(kid(r, 'events') || r)), sid: nsid() };
  }

  /* ---- Output object types ---- */
  await wf(7, { sheets: Object.keys(sheets).length });
  const out = new JSZip(); const put = (p, d) => out.file(p, d, { createFolders: false }); put('project.c3proj', '');
  let uid = maxUid; const sglProps = n => (TPL.single[n] || {});
  const frameJson = (f, w, h, pts) => ({ width: w, height: h, originX: N(f.getAttribute('hotspotX') || 0.5), originY: N(f.getAttribute('hotspotY') || 0.5), originalSource: f.getAttribute('original-source') || '',
    exportFormat: 'lossless', exportQuality: 0.8, fileType: 'image/png', imageSpriteId: spriteId(),
    ...(pts.length ? { imagePoints: pts } : {}), ...(kid(f, 'collision-poly') ? { collisionPoly: { points: kids(kid(f, 'collision-poly'), 'point').flatMap(p => [N(p.getAttribute('x')), N(p.getAttribute('y'))]) } } : {}),
    useCollisionPoly: true, duration: N(f.getAttribute('duration') || 1), tag: '' });
  const otOut = {};
  for (const [n, el] of Object.entries(objs)) {
    const plug = plugOf(n), name = plug === 'LocalStorage' ? 'LocalStorage' : n, sid = N(el.getAttribute('sid') || nsid());
    if (plug === 'LocalStorage') st.storage = true;
    let j;
    if (SINGLETONS.includes(plug)) j = { name, 'plugin-id': plug, sid, 'singleglobal-inst': { type: plug, properties: sglProps(plug), uid: ++uid, sid: nsid(), tags: '' } };
    else {
      j = { name, 'plugin-id': plug, sid, isGlobal: false, editorNewInstanceIsReplica: true, instanceVariables: ivars(el), behaviorTypes: bts(el), effectTypes: fxs(el) };
      if (plug === 'Sprite') {
        const items = [];
        kids(kid(el, 'animation-folder'), 'animation').forEach(a => {
          const an = a.getAttribute('name'), frames = kids(a, 'frame').map((f, i) => {
            const fn = spriteName(n, an, i), rec = img[('animations/' + n + '/' + an + '/' + String(i).padStart(3, '0') + '.png').toLowerCase()];
            if (!rec) { warn('Missing image for ' + n + ' / ' + an + ' / frame ' + i); return frameJson(f, 1, 1, []); }
            outImages[fn] = rec.b;
            return frameJson(f, rec.w, rec.h, kids(f, 'image-point').map(p => ({ name: p.getAttribute('name'), x: N(p.getAttribute('x')), y: N(p.getAttribute('y')) })));
          });
          items.push({ frames, sid: N(a.getAttribute('sid') || nsid()), name: an, isLooping: a.getAttribute('loop') === '1', isPingPong: a.getAttribute('pingpong') === '1',
            repeatCount: N(a.getAttribute('repeatcount') || 1), repeatTo: N(a.getAttribute('repeatto') || 0), speed: N(a.getAttribute('speed') || 5) });
        });
        j.animations = { items, subfolders: [] };
      } else {
        const rec = img[('textures/' + n + '.png').toLowerCase()];
        if (!rec) warn('Missing texture for ' + n + ' (' + plug + ')');
        else { outImages[n.toLowerCase() + '.png'] = rec.b;
          j.image = { width: rec.w, height: rec.h, originX: 0.5, originY: 0.5, originalSource: kid(el, 'texture')?.getAttribute('original-source') || '', exportFormat: 'lossless', exportQuality: 0.8,
            fileType: 'image/png', imageSpriteId: spriteId(), useCollisionPoly: true, tag: '' }; }
      }
    }
    otOut[n] = { j, path: BS('objectTypes', pathOf[n], name + '.json') };
  }
  if (st.storage && !Object.values(otOut).some(o => o.j.name === 'LocalStorage')) {
    add('plugin', 'LocalStorage', 'Local storage');
    const j = { name: 'LocalStorage', 'plugin-id': 'LocalStorage', sid: nsid(), 'singleglobal-inst': { type: 'LocalStorage', properties: { 'in-memory-only': false }, uid: ++uid, sid: nsid(), tags: '' } };
    otOut.LocalStorage = { j, path: BS('objectTypes', 'Plugins', 'LocalStorage.json') };
    (otTree.subfolders.find(s => s.name === 'Plugins') || (otTree.subfolders.push({ name: 'Plugins', items: [], subfolders: [] }), otTree.subfolders.at(-1))).items.push('LocalStorage');
    log('info', 'Added LocalStorage object type');
  }

  /* ---- Audio, icons, other files ---- */
  const root = { script: [], sound: [], music: [], video: [], font: [], icon: [], general: [] };
  let sidc = 5e14;
  const names = el => kids(el, 'file').map(f => f.getAttribute('name'));
  const sNames = names(kid(P, 'sounds-folder')), mNames = names(kid(P, 'music-folder'));
  const mime = n => /\.ogg$/i.test(n) ? 'audio/ogg; codecs=vorbis' : /\.m4a$/i.test(n) ? 'audio/mp4' : /\.webm$/i.test(n) ? 'audio/webm; codecs=opus' : 'audio/mpeg';
  const iconNames = []; const walkF = el => kids(el).forEach(c => { if (c.tagName === 'file') iconNames.push(c.getAttribute('name')); else walkF(c); });
  walkF(kid(P, 'files-folder'));
  let assets = 0;
  for (const x of files) {
    const m = x.p.match(/^files\/([^/]+)$/i); if (!m) continue;
    const base = m[1], data = await x.f.async('uint8array');
    if (sNames.includes(base) || mNames.includes(base) || (/\.(ogg|m4a|mp3|wav|webm)$/i.test(base) && !iconNames.includes(base))) {
      const k = mNames.includes(base) ? 'music' : 'sound';
      put(BS(k === 'music' ? 'music' : 'sounds', base), data); root[k].push({ name: base, type: mime(base), sid: ++sidc, 'file-info': { purpose: 'none' } }); assets++;
    } else if (/\.png$/i.test(base) && /icon|logo/i.test(base)) {
      put(BS('icons', base), data); root.icon.push({ name: base, type: 'image/png', sid: ++sidc, 'icon-info': { purpose: /logo/i.test(base) ? 'loading-logo' : 'app-icon' } }); assets++;
    } else { put(BS('files', base), data); root.general.push({ name: base, type: 'application/octet-stream', sid: ++sidc, 'file-info': { purpose: 'none' } }); assets++; }
  }

  /* ---- Project file ---- */
  const cs = {}; kids(kid(P, 'configuration-settings'), 'prop').forEach(p => cs[p.getAttribute('name')] = txt(p));
  const FS = { 'letterbox scale': 'letterbox-scale', 'letterbox integer scale': 'letterbox-integer-scale', crop: 'crop', 'scale outer': 'scale-outer', 'scale inner': 'scale-inner', off: 'off' };
  const name = val(P, 'name') || 'Converted game';
  const folder = k => ({ items: root[k], subfolders: [] });
  const c3proj = {
    projectFormatVersion: 1, savedWithRelease: 50603, name, runtime: 'c3', useWorker: 'auto', bundleAddons: false, usedAddons: addons, uniqueId: val(P, 'unique-id') || 'c2c3' + Math.random().toString(36).slice(2, 12),
    objectTypes: otTree, functionsName: 'Functions', autosaveData: null, containers: [],
    families: { items: families.map(f => f.getAttribute('name')), subfolders: [] }, layouts: { items: Object.keys(layouts), subfolders: [] }, eventSheets: { items: Object.keys(sheets), subfolders: [] },
    rootFileFolders: { script: folder('script'), sound: folder('sound'), music: folder('music'), video: folder('video'), font: folder('font'), icon: folder('icon'), general: folder('general') },
    timelines: { items: [], subfolders: [] }, flowcharts: { items: [], subfolders: [] }, models3d: { items: [], subfolders: [] },
    properties: { ...TPL.proj, description: val(P, 'description') || name, version: val(P, 'version') || '1.0.0', author: val(P, 'author'), authorEmail: val(P, 'author-email'), authorWebsite: val(P, 'author-website'), appId: val(P, 'app-id'),
      pixelRounding: val(P, 'pixel-rounding') === '1', useLoaderLayout: val(P, 'use-loader-layout') === '1', fullscreenMode: FS[(cs['Fullscreen in browser'] || '').toLowerCase()] || 'letterbox-scale',
      sampling: /linear/i.test(cs.Sampling || '') ? 'trilinear' : 'nearest', preloadSounds: /yes/i.test(cs['Preload sounds'] || ''), loaderStyle: /nothing/i.test(cs['Loader style'] || '') ? 'none' : 'progress-bar',
      orientations: (cs.Orientations || 'any').toLowerCase() },
    viewportWidth: parseInt(val(kid(P, 'window-size'), 'width')) || 1280, viewportHeight: parseInt(val(kid(P, 'window-size'), 'height')) || 720, firstLayout: val(P, 'first-layout') || Object.keys(layouts)[0] || ''
  };
  put('project.c3proj', J(c3proj));
  ['objecttypes', 'projectfiles', 'models3d'].forEach(n => put(n + '.uistate.json', '[]'));
  Object.values(otOut).forEach(o => put(o.path, J(o.j)));
  families.forEach(f => put(BS('families', f.getAttribute('name') + '.json'), J({ name: f.getAttribute('name'), 'plugin-id': f.getAttribute('plugin-id'), sid: N(f.getAttribute('sid') || nsid()),
    instanceVariables: ivars(f), behaviorTypes: bts(f), effectTypes: fxs(f), members: kids(kid(f, 'members'), 'member').map(txt) })));
  Object.entries(sheets).forEach(([n, s]) => put(BS('eventSheets', n + '.json'), J(s)));
  Object.entries(layouts).forEach(([n, l]) => put(BS('layouts', n + '.json'), J(l)));
  Object.entries(outImages).forEach(([n, b]) => put(BS('images', n), b));

  const nOt = Object.keys(otOut).length, nImg = Object.keys(outImages).length;
  log('ok', `Done: ${nOt} object types, ${families.length} families, ${Object.keys(sheets).length} event sheets, ${Object.keys(layouts).length} layouts, ${nImg} images, ${assets} other files`);
  if (!Object.keys(sheets).length) warn('No event sheets found in the archive');
  const blob = await out.generateAsync({ type: 'blob', compression: 'DEFLATE', platform: 'UNIX' });
  return { blob, name, storage: st.storage, warnings: st.warn,
    stats: [[nOt, 'Object types'], [Object.keys(sheets).length, 'Event sheets'], [Object.keys(layouts).length, 'Layouts'], [nImg + assets, 'Assets'], [st.warn, 'Warnings']] };
}

/* ===== UI ===== */
const $ = id => document.getElementById(id);
let url = null, entries = [];
const log = (lvl, msg) => { entries.push([lvl, msg]); WF.log(lvl, msg); };
const wfx = async (fn, ...a) => { try { return await WF[fn](...a); } catch (e) { console.warn('WF', e); } };  // visualizer must never break conversion

function setMsg(cls, text) { $('msg').innerHTML = ''; if (!text) return; const d = document.createElement('div'); d.className = 'note ' + cls; d.textContent = text; $('msg').append(d); }
function showTab(n) {
  [1, 2].forEach(i => { $('t' + i).setAttribute('aria-selected', i === n); $('p' + i).hidden = i !== n; });
}
function renderLog() {
  const box = $('log'); box.innerHTML = '';
  entries.forEach(([lvl, m]) => { const d = document.createElement('div'); d.className = lvl; d.textContent = m; box.append(d); });
}
function reset() {
  if (url) URL.revokeObjectURL(url); url = null; entries = [];
  $('result').hidden = true; $('drop').hidden = false; setMsg('', ''); $('file').value = ''; showTab(1); wfx('reset');
}

async function processFile(file) {
  if (!/\.(capx|zip)$/i.test(file.name)) return setMsg('err', 'Choose a .capx or .zip file.');
  if (url) URL.revokeObjectURL(url);
  entries = []; $('result').hidden = true; setMsg('ok', 'Converting ' + file.name + '…');
  try {
    await wfx('begin', file); $('drop').hidden = true;
    log('info', 'Reading ' + file.name);
    const src = await JSZip.loadAsync(file);
    const r = await convert(src, log);
    url = URL.createObjectURL(r.blob);
    $('dl').href = url; $('dl').download = String(r.name || 'project').replace(/[\\/:*?"<>|]/g, '_') + '.c3p';
    await wfx('done', r, url, $('dl').download);
    $('stats').innerHTML = '';
    r.stats.forEach(([v, l]) => { const s = document.createElement('div'); s.className = 'stat'; s.innerHTML = '<b></b><span></span>'; s.firstChild.textContent = v; s.lastChild.textContent = l; $('stats').append(s); });
    $('storageNote').hidden = !r.storage;
    renderLog(); showTab(1); $('result').hidden = false; $('drop').hidden = true;
    setMsg('ok', r.warnings ? `Converted with ${r.warnings} warning(s). See Conversion details.` : 'Conversion successful.');
  } catch (err) {
    console.error(err); renderLog(); wfx('fail', err.message); $('drop').hidden = false;
    setMsg('err', 'Conversion failed: ' + err.message);
  }
}

$('drop').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', e => { if (e.target.files[0]) processFile(e.target.files[0]); });
['dragenter', 'dragover'].forEach(n => $('drop').addEventListener(n, e => { e.preventDefault(); $('drop').classList.add('over'); }));
['dragleave', 'drop'].forEach(n => $('drop').addEventListener(n, e => { e.preventDefault(); $('drop').classList.remove('over'); }));
$('drop').addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) processFile(f); });
$('t1').addEventListener('click', () => showTab(1));
$('t2').addEventListener('click', () => showTab(2));
$('again').addEventListener('click', reset);
