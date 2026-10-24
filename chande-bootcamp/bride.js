/* Chan City — NPC quà admin đi theo người chơi: server gửi loại NPC trong tin 'pj' (nf), của mình đọc G.flags.
   bride: cô dâu của Ben Jr (váy cưới dài, khăn voan, vương miện, bó hoa, thả tim). tocdai: Anh Tóc Dài của Mèn Mén (tóc đỏ búi, danh hiệu Huyền Thoại ánh vàng, nói linh tinh).
   Đi cạnh chủ hơi lùi về sau (thú cưng đi trước, Lính Cát đi sau nên không đè nhau). Ai cũng thấy. Nối vào MAPX.draw như pets.js. */
(function(){
const X=window.MAPX;
// khăn voan, vương miện, váy dài, bó hoa: toạ độ theo lưới người 20×35 (khung 32×48 neo ở chân), vẽ trước khi lật nên tự quay theo hướng
function brideExtra(ctx,tx,ty){
  for(let i=0;i<9;i++){ const w=9+i, x0=tx+10-Math.floor(w/2); ctx.fillStyle='#fbf8f2'; ctx.fillRect(x0,ty+26+i,w,1); ctx.fillStyle='#e2dacb'; ctx.fillRect(x0,ty+26+i,1,1); ctx.fillRect(x0+w-1,ty+26+i,1,1); }   /* váy cưới dài xoè chấm đất */
  ctx.fillStyle='#e2dacb'; ctx.fillRect(tx+4,ty+34,13,1);
  ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(tx+5,ty,8,2); ctx.fillRect(tx+3,ty+1,4,18); ctx.fillRect(tx+1,ty+7,3,15);
  ctx.fillStyle='#f0d27a'; ctx.fillRect(tx+7,ty-1,5,1); ctx.fillStyle='#fffbe8'; ctx.fillRect(tx+8,ty-2,1,1); ctx.fillRect(tx+10,ty-2,1,1);
  ctx.fillStyle='#3a8a4a'; ctx.fillRect(tx+15,ty+21,1,3); ctx.fillStyle='#ff6a8a'; ctx.fillRect(tx+14,ty+19,3,2); ctx.fillStyle='#ffd0dc'; ctx.fillRect(tx+15,ty+18,2,1); ctx.fillStyle='#ffffff'; ctx.fillRect(tx+13,ty+20,1,1); }
// búi tóc tròn sau đỉnh đầu
function bunExtra(ctx,tx,ty){ ctx.fillStyle='#1c1516'; ctx.fillRect(tx+4,ty-2,4,1); ctx.fillRect(tx+3,ty-1,1,1); ctx.fillRect(tx+8,ty-1,1,1); ctx.fillRect(tx+2,ty,1,3); ctx.fillRect(tx+9,ty,1,2);
  ctx.fillStyle='#e2582e'; ctx.fillRect(tx+4,ty-1,4,1); ctx.fillRect(tx+3,ty,6,4); ctx.fillStyle='#f27a48'; ctx.fillRect(tx+4,ty-1,2,1); ctx.fillRect(tx+3,ty,2,1); ctx.fillStyle='#b8401e'; ctx.fillRect(tx+6,ty+2,3,1); }
const KINDS={
  bride:{look:{gender:'nu',hair:'long',hairColor:'2a1c18',skin:'f3c4a8',outfit:{top:'ao_codau',bottom:'vay_codau',shoes:'giay_trang'}},extra:brideExtra,hearts:true},
  tocdai:{name:'Anh Tóc Dài',title:{pre:'⚜ ',name:'Huyền Thoại',fx:'gold',edge:'#ffd84a'},look:{gender:'nam',hair:'long',hairColor:'e2582e',skin:'f6c8b8',outfit:{top:'tee_trang',bottom:'jean',shoes:'giay_trang'}},extra:bunExtra,
    lines:['Alo em, kakaka','Em không có tư duy à','Anh không muốn training người lạ','Dương đâu rồi em','Oke em']}};
const AV={}; const av=k=>AV[k]||(AV[k]=AVATAR.build(KINDS[k].look));
const mine={x:0,y:0,face:1,t:0,kind:'',scene:''}, rem=new Map(); let last=performance.now();
NET.listen('pj',m=>{ const r=GAME.REM&&GAME.REM.get(m.id); if(r) r.nf=m.nf||''; });
const myKind=G=>!G.flags?'':G.flags.bride?'bride':G.flags.tocdai?'tocdai':'';
// chạy theo điểm cạnh chủ, chủ đứng yên thì quay cùng hướng với chủ
function follow(f,tx,ty,face,dt){ const bx=tx-face*20, by=ty-4, dx=bx-f.x, dy=by-f.y, d=Math.hypot(dx,dy); f.t+=dt;
  if(d>260){ f.x=bx; f.y=by; return false; }
  if(d>3){ const sp=Math.min(d,Math.max(70,d*3)*dt); f.x+=dx/d*sp; f.y+=dy/d*sp; if(Math.abs(dx)>1) f.face=dx>0?1:-1; return true; }
  f.face=face; return false; }
// nói 1 câu mỗi 7–12 giây, hiện 3 giây
function talk(f,K){ if(!K.lines) return ''; if(!f.next) f.next=f.t+2+Math.random()*4;
  if(f.t>=f.next){ f.line=K.lines[(f.li=((f.li??Math.floor(Math.random()*K.lines.length))+1)%K.lines.length)]; f.lineT=f.t; f.next=f.t+7+Math.random()*5; }
  return f.line&&f.t-f.lineT<3?f.line:''; }
function put(list,ctx,f,k,moving){ const K=KINDS[k], A=av(k); if(!A) return; const an=A.anims[moving?'walk':'idle'], fr=an.frames[Math.floor(f.t*an.fps)%an.frames.length], cam=GAME.cam;
  list.push({y:f.y,d:()=>{ GAME.shadow(f.x,f.y,8); const X0=Math.round(f.x-cam.x), Y0=Math.round(f.y-cam.y); ctx.save(); if(f.face<0){ ctx.translate(X0*2,0); ctx.scale(-1,1); }
    ctx.drawImage(fr,X0-16,Y0-48); if(K.extra) K.extra(ctx,X0-10,Y0-35); ctx.restore();
    if(K.hearts){ const ph=(f.t%5)/5; if(ph<.4){ ctx.save(); ctx.globalAlpha=1-ph/.4; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.fillText('💕',X0+3,Y0-40-ph*30); ctx.restore(); } } }});
  if(K.name&&GAME.SAYS) GAME.SAYS.push({x:f.x,y:f.y-46,name:K.name,title:K.title,text:talk(f,K)}); }
const d0=X.draw; X.draw=(list,ctx)=>{ d0(list,ctx); const S=GAME.S, G=GAME.G, P=GAME.P; if(!S||!G||!P||!window.AVATAR) return; const t=performance.now(), dt=Math.min(.05,(t-last)/1000); last=t;
  const k=myKind(G);
  if(k&&!P.pcar&&!P.kayak){ if(mine.kind!==k||mine.scene!==S.kind){ mine.kind=k; mine.scene=S.kind; mine.x=P.x-20; mine.y=P.y-4; } put(list,ctx,mine,k,follow(mine,P.x,P.y,P.face||1,dt)); }
  else mine.kind='';
  for(const r of (GAME.REM||new Map()).values()){ if(!r.nf||!KINDS[r.nf]||r.scene&&r.scene!==S.kind) continue; let f=rem.get(r.id); if(!f){ f={x:r.x-20,y:r.y-4,face:1,t:0}; rem.set(r.id,f); }
    put(list,ctx,f,r.nf,follow(f,r.x,r.y,r.face||1,dt)); } };
})();
