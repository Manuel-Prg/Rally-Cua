import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_CwtUBU6d.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_CX-m9NMn.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/Manue/Documents/Rally-Cua/","cacheDir":"file:///C:/Users/Manue/Documents/Rally-Cua/node_modules/.astro/","outDir":"file:///C:/Users/Manue/Documents/Rally-Cua/dist/","srcDir":"file:///C:/Users/Manue/Documents/Rally-Cua/src/","publicDir":"file:///C:/Users/Manue/Documents/Rally-Cua/public/","buildClientDir":"file:///C:/Users/Manue/Documents/Rally-Cua/dist/client/","buildServerDir":"file:///C:/Users/Manue/Documents/Rally-Cua/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"@import\"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap\";.nav[data-astro-cid-37fxchfa]{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;background:var(--earth);border-bottom:3px solid var(--dirt);height:64px;gap:1rem}.nav-logo[data-astro-cid-37fxchfa]{font-family:Bebas Neue,sans-serif;font-size:1.8rem;letter-spacing:.1em;color:var(--dirt);text-shadow:0 0 20px rgba(196,163,90,.3);flex-shrink:0}.nav-logo[data-astro-cid-37fxchfa] span[data-astro-cid-37fxchfa]{color:var(--rust)}.nav-tabs[data-astro-cid-37fxchfa]{display:flex;height:100%;gap:0}.nav-tab[data-astro-cid-37fxchfa]{font-family:Barlow Condensed,sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;padding:0 1.4rem;height:100%;display:flex;align-items:center;color:var(--fog);border-bottom:3px solid transparent;margin-bottom:-3px;transition:color .2s,background .2s}.nav-tab[data-astro-cid-37fxchfa]:hover{color:var(--sand);background:#c4a35a0d}.nav-tab[data-astro-cid-37fxchfa].active{color:var(--dirt);border-bottom-color:var(--dirt);background:#c4a35a14}.live-badge[data-astro-cid-37fxchfa]{display:flex;align-items:center;gap:.4rem;font-family:Barlow Condensed,sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--moss-light);flex-shrink:0}.live-dot[data-astro-cid-37fxchfa]{width:8px;height:8px;border-radius:50%;background:#5cdb5c;box-shadow:0 0 8px #5cdb5c;animation:blink 1.6s ease-in-out infinite}@keyframes blink{0%,to{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}@media(max-width:480px){.nav[data-astro-cid-37fxchfa]{padding:0 1rem}.nav-tab[data-astro-cid-37fxchfa]{padding:0 .9rem;font-size:.75rem}.live-badge[data-astro-cid-37fxchfa]{display:none}}:root{--dirt: #c4a35a;--dirt-dark: #8b6914;--earth: #3d2b1f;--bark: #2a1e15;--moss: #4a5c3a;--moss-light: #6b7f55;--rust: #b84a1e;--sand: #e8d5a3;--fog: #d4c9b0;--ash: #f2ede0;--ink: #1a1208}*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}body{font-family:Barlow,sans-serif;background:var(--bark);color:var(--ash);min-height:100vh;overflow-x:hidden}body:before{content:\"\";position:fixed;inset:0;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\");pointer-events:none;z-index:0;opacity:.35}main{position:relative;z-index:1}\n"},{"type":"external","src":"/_astro/admin.BON2Y5HV.css"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/create-team","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/create-team\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"create-team","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/create-team.ts","pathname":"/api/create-team","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/register","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/register\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/register.ts","pathname":"/api/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/update-score","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/update-score\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"update-score","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/update-score.ts","pathname":"/api/update-score","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/registro.DM2T-tpu.css"}],"routeData":{"route":"/registro","isIndex":false,"type":"page","pattern":"^\\/registro\\/?$","segments":[[{"content":"registro","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/registro.astro","pathname":"/registro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"@import\"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap\";.nav[data-astro-cid-37fxchfa]{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;background:var(--earth);border-bottom:3px solid var(--dirt);height:64px;gap:1rem}.nav-logo[data-astro-cid-37fxchfa]{font-family:Bebas Neue,sans-serif;font-size:1.8rem;letter-spacing:.1em;color:var(--dirt);text-shadow:0 0 20px rgba(196,163,90,.3);flex-shrink:0}.nav-logo[data-astro-cid-37fxchfa] span[data-astro-cid-37fxchfa]{color:var(--rust)}.nav-tabs[data-astro-cid-37fxchfa]{display:flex;height:100%;gap:0}.nav-tab[data-astro-cid-37fxchfa]{font-family:Barlow Condensed,sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;padding:0 1.4rem;height:100%;display:flex;align-items:center;color:var(--fog);border-bottom:3px solid transparent;margin-bottom:-3px;transition:color .2s,background .2s}.nav-tab[data-astro-cid-37fxchfa]:hover{color:var(--sand);background:#c4a35a0d}.nav-tab[data-astro-cid-37fxchfa].active{color:var(--dirt);border-bottom-color:var(--dirt);background:#c4a35a14}.live-badge[data-astro-cid-37fxchfa]{display:flex;align-items:center;gap:.4rem;font-family:Barlow Condensed,sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--moss-light);flex-shrink:0}.live-dot[data-astro-cid-37fxchfa]{width:8px;height:8px;border-radius:50%;background:#5cdb5c;box-shadow:0 0 8px #5cdb5c;animation:blink 1.6s ease-in-out infinite}@keyframes blink{0%,to{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}@media(max-width:480px){.nav[data-astro-cid-37fxchfa]{padding:0 1rem}.nav-tab[data-astro-cid-37fxchfa]{padding:0 .9rem;font-size:.75rem}.live-badge[data-astro-cid-37fxchfa]{display:none}}:root{--dirt: #c4a35a;--dirt-dark: #8b6914;--earth: #3d2b1f;--bark: #2a1e15;--moss: #4a5c3a;--moss-light: #6b7f55;--rust: #b84a1e;--sand: #e8d5a3;--fog: #d4c9b0;--ash: #f2ede0;--ink: #1a1208}*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}body{font-family:Barlow,sans-serif;background:var(--bark);color:var(--ash);min-height:100vh;overflow-x:hidden}body:before{content:\"\";position:fixed;inset:0;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\");pointer-events:none;z-index:0;opacity:.35}main{position:relative;z-index:1}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Manue/Documents/Rally-Cua/src/pages/registro.astro",{"propagation":"none","containsHead":true}],["C:/Users/Manue/Documents/Rally-Cua/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["C:/Users/Manue/Documents/Rally-Cua/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/create-team@_@ts":"pages/api/create-team.astro.mjs","\u0000@astro-page:src/pages/api/register@_@ts":"pages/api/register.astro.mjs","\u0000@astro-page:src/pages/api/update-score@_@ts":"pages/api/update-score.astro.mjs","\u0000@astro-page:src/pages/registro@_@astro":"pages/registro.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BvpBvKqn.mjs","C:/Users/Manue/Documents/Rally-Cua/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BO-964Y6.mjs","C:/Users/Manue/Documents/Rally-Cua/src/components/RegistrationForm":"_astro/RegistrationForm.Bv8pHHfV.js","C:/Users/Manue/Documents/Rally-Cua/src/components/ScoreboardLive":"_astro/ScoreboardLive.DRn31bnU.js","@astrojs/react/client.js":"_astro/client.Dc9Vh3na.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/admin.BON2Y5HV.css","/_astro/registro.DM2T-tpu.css","/favicon.ico","/favicon.svg","/_astro/client.Dc9Vh3na.js","/_astro/index.DiEladB3.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/RegistrationForm.Bv8pHHfV.js","/_astro/ScoreboardLive.DRn31bnU.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"a/MrtZA5W5hRWTZCp9wd/g+vUlNby9ZsYPl9IBnEP0I="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
