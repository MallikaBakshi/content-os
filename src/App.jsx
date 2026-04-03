import { useState } from "react";

// ─── API ─────────────────────────────────────────────────────
async function generate(prompt, key) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1400,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

const gv = (t, k) => t?.match(new RegExp(`${k}:\\s*([^\\n]+)`, "i"))?.[1]?.trim() || "";
const gb = (t, k) => t?.match(new RegExp(`${k}:\\s*([\\s\\S]+?)(?=\\n[A-Z_]{2,}:|$)`, "i"))?.[1]?.trim() || "";

// ─── BUILD BRAND PROMPT FROM USER SETTINGS ───────────────────
// No personal details hardcoded — all comes from user's settings
function buildBrand(profile) {
  return `You are ghostwriting for a content creator. Write in their voice exactly.

WHO THEY ARE:
${profile.name ? `Name/Handle: ${profile.name}` : ""}
${profile.role ? `Role/Expertise: ${profile.role}` : ""}
${profile.audience ? `Target Audience: ${profile.audience}` : ""}
${profile.niche ? `Content Niche: ${profile.niche}` : ""}
${profile.rules ? `Important Rules: ${profile.rules}` : ""}

VOICE & STYLE:
${profile.voice || "Real talk. Punchy sentences. Warm but direct. Zero jargon. Sounds like a smart friend, not a consultant."}

Never break character. Write exactly as this person would speak.`;
}

// ─── DEFAULT PROFILE (blank — user fills this in) ────────────
const DEFAULT_PROFILE = {
  name: "",
  role: "",
  audience: "",
  niche: "",
  voice: "",
  rules: "",
  handle: "@yourusername",
  brandName: "Creator OS",
};

// ─── DESIGN ──────────────────────────────────────────────────
const C = {
  bg:"#f8f7f4", card:"#fff", ink:"#1a1a1a", muted:"#6b6b6b",
  faint:"#e8e5df", line:"#edeae4",
  gold:"#b8870c", goldL:"#fef9ee", goldB:"#e8d59f",
  blue:"#1d4ed8", blueL:"#eff6ff", blueB:"#bfdbfe",
  green:"#166534", greenL:"#f0fdf4", greenB:"#bbf7d0",
  red:"#991b1b", redL:"#fff1f2", redB:"#fecaca",
  purple:"#5b21b6", purpleL:"#f5f3ff",
  amber:"#92400e", amberL:"#fffbeb", amberB:"#fde68a",
};

const DPALS=[{bg:"#0a0a0a",acc:"#c9a84c",grad:"#1a1000"},{bg:"#0f1729",acc:"#60a5fa",grad:"#0a1020"},{bg:"#0d2818",acc:"#4ade80",grad:"#062010"},{bg:"#1e1040",acc:"#a78bfa",grad:"#14082a"},{bg:"#1c0a00",acc:"#fb923c",grad:"#120500"},{bg:"#001a2c",acc:"#38bdf8",grad:"#001018"},{bg:"#1a001a",acc:"#f472b6",grad:"#100010"}];
const NPALS=[{accent:"#1d4ed8"},{accent:"#166534"},{accent:"#7c3aed"},{accent:"#b45309"},{accent:"#0e7490"},{accent:"#be185d"},{accent:"#1d4ed8"}];
const DGRADS=[["#0f1729","#1e3a8a"],["#0d2818","#064e3b"],["#1e1040","#3b0764"],["#1c0a00","#7c2d12"],["#001a2c","#0c4a6e"],["#1a001a","#831843"],["#1a1a1a","#374151"]];
const SACCS=["#1d4ed8","#166534","#7c3aed","#b45309","#0e7490","#be185d","#1d4ed8"];
const QBGS=["#0a0a0a","#0f1729","#0d2818","#1e1040","#1c0a00","#001a2c","#1a001a"];
const QACCS=["#c9a84c","#60a5fa","#4ade80","#a78bfa","#fb923c","#38bdf8","#f472b6"];

// ─── ATOMS ───────────────────────────────────────────────────
const Chip=({label,color=C.blue,bg=C.blueL,xs})=><span style={{background:bg,color,fontSize:xs?9:10,fontWeight:700,padding:xs?"1px 7px":"2px 10px",borderRadius:20,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{label}</span>;
const Btn=({children,onClick,disabled,v="dark",sm})=>{
  const S={dark:{background:C.ink,color:"#fff",border:"none"},gold:{background:C.gold,color:"#fff",border:"none"},ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.faint}`},outline:{background:"transparent",color:C.blue,border:`1.5px solid ${C.blue}`},green:{background:C.green,color:"#fff",border:"none"},red:{background:"transparent",color:C.red,border:`1px solid ${C.redB}`}};
  return <button onClick={onClick} disabled={disabled} style={{...(S[v]||S.dark),borderRadius:9,padding:sm?"5px 12px":"9px 20px",fontSize:sm?12:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.38:1,fontFamily:"inherit"}}>{children}</button>;
};
const SL=({children,dot})=><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>{dot&&<div style={{width:3,height:13,background:dot,borderRadius:2}}/>}<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:C.muted}}>{children}</span></div>;
const HR=()=><div style={{height:1,background:C.line,margin:"12px 0"}}/>;
const Box=({children,style={},ac,fill})=><div style={{background:fill||C.card,borderRadius:12,border:`1px solid ${ac||C.line}`,padding:"14px 16px",...style}}>{children}</div>;
const Spin=({msg})=><div style={{display:"flex",gap:10,alignItems:"center",padding:"14px 0",color:C.muted,fontSize:13}}><div style={{width:16,height:16,border:`2px solid ${C.faint}`,borderTopColor:C.ink,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>{msg}</div>;
const Input=({label,value,onChange,placeholder,textarea,rows=3,hint})=><div style={{marginBottom:14}}>
  <div style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
  {textarea
    ?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",fontSize:13,lineHeight:1.7,padding:"8px 11px",borderRadius:9,border:`1px solid ${C.faint}`,background:C.card,color:C.ink,resize:"vertical",boxSizing:"border-box"}}/>
    :<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",fontSize:13,padding:"8px 11px",borderRadius:9,border:`1px solid ${C.faint}`,background:C.card,color:C.ink}}/>
  }
  {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
</div>;

// ─── SCRIPT VIEWER ───────────────────────────────────────────
function ScriptView({text}){
  const pal={HOOK:"#dc2626",AGITATE:"#ea580c",VALUE:"#1d4ed8",PROOF:"#166534",CTA:"#5b21b6"};
  const parts=text.split(/(\[(?:HOOK|AGITATE|VALUE|PROOF|CTA)\])/g);
  const blocks=[];
  for(let i=1;i<parts.length;i+=2){const tag=parts[i].replace(/[\[\]]/g,"");const body=(parts[i+1]||"").trim();if(body)blocks.push({tag,body});}
  if(!blocks.length)return <p style={{fontSize:14,lineHeight:1.9,color:C.ink,whiteSpace:"pre-wrap",fontFamily:"Georgia,serif",margin:0}}>{text}</p>;
  return <div style={{display:"flex",flexDirection:"column",gap:11}}>{blocks.map((b,i)=><div key={i} style={{display:"flex",gap:11}}><div style={{width:3,borderRadius:2,background:pal[b.tag]||"#ccc",flexShrink:0}}/><div><div style={{fontSize:9,fontWeight:800,color:pal[b.tag],letterSpacing:"0.1em",marginBottom:3}}>{b.tag}</div><div style={{fontSize:14,color:C.ink,lineHeight:1.9,fontFamily:"Georgia,serif"}}>{b.body}</div></div></div>)}</div>;
}

// ─── DOWNLOAD HELPERS ────────────────────────────────────────
function dlTxt(content,filename){const a=document.createElement("a");a.href="data:text/plain;charset=utf-8,"+encodeURIComponent(content);a.download=filename;a.click();}

function dlScriptPNG(script,topic,day,handle){
  const W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const ctx=cv.getContext("2d");const pad=90;
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#0a0a0a");bg.addColorStop(1,"#1a1000");
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const gl=ctx.createLinearGradient(0,0,W,0);gl.addColorStop(0,"transparent");gl.addColorStop(.5,"#c9a84c88");gl.addColorStop(1,"transparent");
  ctx.fillStyle=gl;ctx.fillRect(0,0,W,4);
  ctx.font=`800 24px Arial`;ctx.fillStyle="#c9a84c80";ctx.textAlign="left";ctx.fillText(handle||"@yourusername",pad,pad+30);
  if(topic){ctx.font=`500 26px Georgia`;ctx.fillStyle="rgba(255,255,255,0.6)";ctx.fillText(topic.slice(0,60),pad,pad+72);}
  const pal={HOOK:"#ef4444",AGITATE:"#f97316",VALUE:"#60a5fa",PROOF:"#4ade80",CTA:"#c084fc"};
  const parts=script.split(/(\[(?:HOOK|AGITATE|VALUE|PROOF|CTA)\])/g);const blocks=[];
  for(let i=1;i<parts.length;i+=2){const tag=parts[i].replace(/[\[\]]/g,"");const body=(parts[i+1]||"").trim();if(body)blocks.push({tag,body});}
  let y=180;const lh=38;const maxW=W-pad*2-20;
  for(const b of blocks){
    if(y>H-200)break;
    ctx.font=`800 14px Arial`;ctx.fillStyle=pal[b.tag]||"#888";ctx.fillText(b.tag,pad,y);y+=22;
    ctx.font=`400 26px Georgia`;ctx.fillStyle="rgba(255,255,255,0.85)";
    const words=b.body.split(" ");let line="";const tx=pad+16;
    for(const w of words){const t=line+w+" ";if(ctx.measureText(t).width>maxW&&line){if(y>H-220)break;ctx.fillText(line.trim(),tx,y);y+=lh;line=w+" ";}else line=t;}
    if(line.trim()&&y<=H-220){ctx.fillText(line.trim(),tx,y);y+=lh;}y+=18;
  }
  const by=H-90;ctx.strokeStyle="#c9a84c40";ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(pad,by-44,W-pad*2,52,8);ctx.stroke();
  ctx.font=`600 22px Arial`;ctx.fillStyle="#c9a84c";ctx.textAlign="center";ctx.fillText(`Follow ${handle||"@yourusername"}`,W/2,by-12);
  const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=`${day||"script"}.png`;a.click();
}

function dlTextPostPNG(text,hashtags,handle){
  const W=1080,H=1080,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const ctx=cv.getContext("2d");const pad=90;
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#c9a84c";ctx.fillRect(0,0,5,H);
  ctx.font=`800 20px Arial`;ctx.fillStyle="#c9a84c";ctx.textAlign="left";ctx.fillText(handle||"@yourusername",pad,pad+20);
  ctx.font=`400 32px Georgia`;ctx.fillStyle="#1a1a1a";
  const words=text.split(" ");let line="";let y=pad+70;const maxW=W-pad*2;
  for(const w of words){const t=line+w+" ";if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line.trim(),pad,y);y+=48;line=w+" ";}else line=t;}
  if(line.trim()){ctx.fillText(line.trim(),pad,y);y+=48;}
  if(hashtags){y+=20;ctx.font=`400 20px Arial`;ctx.fillStyle="#1d4ed8";ctx.fillText(hashtags.slice(0,80),pad,y);}
  ctx.font=`600 18px Arial`;ctx.fillStyle="#b8870c";ctx.fillText(handle||"@yourusername",pad,H-60);
  const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download="text-post.png";a.click();
}

function dlNewsletterTxt(nlText){
  const subj=gv(nlText,"SUBJECT");const intro=gb(nlText,"INTRO");
  let out=`NEWSLETTER\n${"=".repeat(50)}\n\nSUBJECT: ${subj}\n\n`;
  if(intro)out+=`${intro}\n\n${"─".repeat(40)}\n\n`;
  for(let n=1;n<=5;n++){const h=gv(nlText,`ITEM_${n}_HEADLINE`);const t=gv(nlText,`ITEM_${n}_TAKE`);if(!h)break;out+=`${n}. ${h}\n${t}\n\n`;}
  const cl=gb(nlText,"CLOSING");if(cl)out+=`${"─".repeat(40)}\n\n${cl}\n`;
  dlTxt(out,"newsletter.txt");
}

function dlAssetTxt(asset){
  const title=gv(asset,"TITLE")||"Lead Magnet";
  const content=asset.match(/CONTENT:\s*([\s\S]+)/i)?.[1]||asset;
  dlTxt(`${title}\n${"=".repeat(title.length)}\n\n${content}`,`${title.toLowerCase().replace(/\s+/g,"-").slice(0,30)}.txt`);
}

// ─── CAROUSEL SLIDES ─────────────────────────────────────────
function BrandedSlide({slide,idx,total,sz=300,handle}){
  const p=DPALS[idx%DPALS.length];
  const pad=Math.round(sz*.09),tsz=idx===0?Math.round(sz*.073):Math.round(sz*.057),bsz=Math.round(sz*.036),msz=Math.round(sz*.027);
  return <div style={{width:sz,height:sz,background:`radial-gradient(ellipse at 80% 20%,${p.grad} 0%,${p.bg} 60%)`,borderRadius:16,padding:pad,display:"flex",flexDirection:"column",justifyContent:"space-between",boxSizing:"border-box",position:"relative",overflow:"hidden",flexShrink:0}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${p.acc}60,transparent)`}}/>
    <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
      <span style={{fontSize:msz,fontWeight:800,letterSpacing:"0.08em",color:`${p.acc}80`,textTransform:"uppercase"}}>{handle||"CREATOR OS"}</span>
      <span style={{fontSize:msz,color:`${p.acc}50`}}>{idx===0?"SWIPE →":`${idx+1}/${total}`}</span>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:`${pad*.4}px 0`,position:"relative"}}>
      {slide.tag&&<div style={{fontSize:msz,fontWeight:700,letterSpacing:"0.08em",color:`${p.acc}70`,marginBottom:pad*.35,textTransform:"uppercase"}}>{slide.tag}</div>}
      <div style={{fontSize:tsz,fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:pad*.3,fontFamily:"Georgia,serif",letterSpacing:"-0.02em"}}>{slide.headline||"—"}</div>
      {slide.body&&<div style={{fontSize:bsz,color:"rgba(255,255,255,0.6)",lineHeight:1.65}}>{slide.body}</div>}
    </div>
    {idx===total-1&&slide.cta?<div style={{border:`1px solid ${p.acc}40`,borderRadius:8,padding:`${pad*.25}px ${pad*.4}px`,textAlign:"center"}}><div style={{fontSize:bsz,color:p.acc,fontWeight:600}}>{slide.cta}</div></div>:<div style={{display:"flex",gap:4}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===idx?16:5,height:5,borderRadius:3,background:i===idx?p.acc:"rgba(255,255,255,0.2)"}}/>)}</div>}
  </div>;
}

function NewsSlide({slide,idx,total,sz=300}){
  const p=NPALS[idx%NPALS.length];
  const pad=Math.round(sz*.08),tsz=idx===0?Math.round(sz*.068):Math.round(sz*.052),bsz=Math.round(sz*.034),msz=Math.round(sz*.026);
  return <div style={{width:sz,height:sz,background:"#fafaf8",borderRadius:16,padding:pad,display:"flex",flexDirection:"column",boxSizing:"border-box",position:"relative",overflow:"hidden",flexShrink:0,border:"1px solid #e8e5df"}}>
    <div style={{position:"absolute",top:0,left:0,bottom:0,width:4,background:p.accent}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:pad*.5,paddingLeft:pad*.3}}><span style={{fontSize:msz,fontWeight:800,letterSpacing:"0.1em",color:p.accent,textTransform:"uppercase"}}>CREATOR OS</span><span style={{fontSize:msz-1,color:"#aaa"}}>{idx+1}/{total}</span></div>
    {slide.source&&<div style={{marginBottom:pad*.4,paddingLeft:pad*.3}}><span style={{background:p.accent,color:"#fff",fontSize:msz-1,fontWeight:700,padding:"2px 8px",borderRadius:4,textTransform:"uppercase"}}>{slide.source}</span></div>}
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",paddingLeft:pad*.3}}>
      <div style={{fontSize:tsz,fontWeight:800,color:"#1a1a1a",lineHeight:1.2,marginBottom:pad*.35,fontFamily:"Georgia,serif"}}>{slide.headline||"—"}</div>
      {slide.summary&&<div style={{fontSize:bsz,color:"#555",lineHeight:1.65,marginBottom:pad*.2}}>{slide.summary}</div>}
      {slide.takeaway&&<div style={{borderTop:"1px solid #e8e5df",paddingTop:pad*.3}}><span style={{fontSize:msz,fontWeight:700,color:p.accent}}>↳ </span><span style={{fontSize:msz+1,color:"#444"}}>{slide.takeaway}</span></div>}
    </div>
    {idx!==total-1?<div style={{display:"flex",gap:4,paddingLeft:pad*.3}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===idx?14:5,height:5,borderRadius:3,background:i===idx?p.accent:"#ddd"}}/>)}</div>:<div style={{paddingLeft:pad*.3,fontSize:bsz,fontWeight:700,color:p.accent}}>{slide.cta}</div>}
  </div>;
}

function DataSlide({slide,idx,total,sz=300}){
  const grad=DGRADS[idx%DGRADS.length];const pad=Math.round(sz*.09),statSz=Math.round(sz*.19),bsz=Math.round(sz*.036),msz=Math.round(sz*.027);
  return <div style={{width:sz,height:sz,background:`linear-gradient(135deg,${grad[0]} 0%,${grad[1]} 100%)`,borderRadius:16,padding:pad,display:"flex",flexDirection:"column",justifyContent:"space-between",boxSizing:"border-box",position:"relative",overflow:"hidden",flexShrink:0}}>
    <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
    <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}><span style={{fontSize:msz,fontWeight:800,letterSpacing:"0.1em",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>CREATOR OS</span><span style={{fontSize:msz,color:"rgba(255,255,255,0.35)"}}>{idx+1}/{total}</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",position:"relative"}}>
      {slide.stat&&<div style={{fontSize:statSz,fontWeight:900,color:"#fff",lineHeight:1,letterSpacing:"-0.04em",marginBottom:pad*.2}}>{slide.stat}</div>}
      {slide.label&&<div style={{fontSize:bsz*1.1,fontWeight:700,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:pad*.4}}>{slide.label}</div>}
      {slide.context&&<div style={{fontSize:bsz,color:"rgba(255,255,255,0.6)",lineHeight:1.6,maxWidth:"90%"}}>{slide.context}</div>}
      {slide.headline&&!slide.stat&&<div style={{fontSize:Math.round(sz*.06),fontWeight:700,color:"#fff",lineHeight:1.2,fontFamily:"Georgia,serif"}}>{slide.headline}</div>}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",position:"relative"}}>
      {slide.source&&<span style={{fontSize:msz-1,color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>{slide.source}</span>}
      {idx!==total-1?<div style={{display:"flex",gap:4}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===idx?14:5,height:5,borderRadius:3,background:i===idx?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.2)"}}/>)}</div>:<div style={{fontSize:bsz,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{slide.cta||""}</div>}
    </div>
  </div>;
}

function StepsSlide({slide,idx,total,sz=300}){
  const acc=SACCS[idx%SACCS.length];const pad=Math.round(sz*.085),tsz=Math.round(sz*.055),bsz=Math.round(sz*.035),msz=Math.round(sz*.027),numSz=Math.round(sz*.28);
  return <div style={{width:sz,height:sz,background:idx===0?C.ink:"#fff",borderRadius:16,padding:pad,display:"flex",flexDirection:"column",justifyContent:"space-between",boxSizing:"border-box",position:"relative",overflow:"hidden",flexShrink:0,border:idx===0?"none":"1px solid #e8e5df"}}>
    {idx!==0&&<div style={{position:"absolute",right:pad*.5,top:"50%",transform:"translateY(-50%)",fontSize:numSz,fontWeight:900,color:`${acc}12`,lineHeight:1,pointerEvents:"none"}}>{slide.step||String(idx).padStart(2,"0")}</div>}
    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:msz,fontWeight:800,letterSpacing:"0.1em",color:idx===0?"rgba(255,255,255,0.4)":"#bbb",textTransform:"uppercase"}}>CREATOR OS</span><span style={{fontSize:msz,color:idx===0?"rgba(255,255,255,0.3)":"#ccc"}}>{idx+1}/{total}</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"}}>
      {idx!==0&&slide.step&&<div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:Math.round(sz*.1),height:Math.round(sz*.1),borderRadius:"50%",background:acc,marginBottom:pad*.4}}><span style={{fontSize:bsz,fontWeight:800,color:"#fff"}}>{slide.step}</span></div>}
      <div style={{fontSize:idx===0?Math.round(sz*.065):tsz,fontWeight:700,color:idx===0?"#fff":C.ink,lineHeight:1.25,marginBottom:pad*.3,fontFamily:idx===0?"Georgia,serif":"inherit"}}>{slide.headline||slide.title||"—"}</div>
      {(slide.detail||slide.body)&&<div style={{fontSize:bsz,color:idx===0?"rgba(255,255,255,0.6)":C.muted,lineHeight:1.65}}>{slide.detail||slide.body}</div>}
      {slide.tip&&idx!==0&&<div style={{marginTop:pad*.4,background:`${acc}12`,borderLeft:`3px solid ${acc}`,borderRadius:"0 6px 6px 0",padding:"5px 8px"}}><span style={{fontSize:msz,fontWeight:700,color:acc}}>TIP  </span><span style={{fontSize:msz+1,color:"#444"}}>{slide.tip}</span></div>}
    </div>
    {idx===total-1&&slide.cta?<div style={{fontSize:bsz,fontWeight:700,color:acc}}>{slide.cta}</div>:<div style={{display:"flex",gap:4}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===idx?14:5,height:5,borderRadius:3,background:i===idx?acc:"#ddd"}}/>)}</div>}
  </div>;
}

function QuoteSlide({slide,idx,total,sz=300}){
  const bg=QBGS[idx%QBGS.length];const acc=QACCS[idx%QACCS.length];const pad=Math.round(sz*.09),qsz=Math.round(sz*.8),tsz=Math.round(sz*.052),bsz=Math.round(sz*.034),msz=Math.round(sz*.027);
  return <div style={{width:sz,height:sz,background:bg,borderRadius:16,padding:pad,display:"flex",flexDirection:"column",justifyContent:"space-between",boxSizing:"border-box",position:"relative",overflow:"hidden",flexShrink:0}}>
    <div style={{position:"absolute",top:-sz*.05,left:pad*.5,fontSize:qsz,fontFamily:"Georgia,serif",color:`${acc}10`,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>"</div>
    <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}><span style={{fontSize:msz,fontWeight:800,letterSpacing:"0.1em",color:`${acc}70`,textTransform:"uppercase"}}>CREATOR OS</span><span style={{fontSize:msz,color:`${acc}40`}}>{idx+1}/{total}</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"}}>
      <div style={{width:28,height:3,background:acc,borderRadius:2,marginBottom:pad*.6}}/>
      <div style={{fontSize:tsz,fontWeight:600,color:"#fff",lineHeight:1.35,fontFamily:"Georgia,serif",fontStyle:"italic",marginBottom:pad*.5}}>"{slide.quote||slide.headline||"—"}"</div>
      {(slide.attribution||slide.body)&&<div><div style={{fontSize:bsz,color:acc,fontWeight:700}}>{slide.attribution||""}</div>{slide.role&&<div style={{fontSize:msz+1,color:"rgba(255,255,255,0.45)",marginTop:2}}>{slide.role}</div>}{slide.body&&!slide.attribution&&<div style={{fontSize:bsz,color:"rgba(255,255,255,0.55)",lineHeight:1.6}}>{slide.body}</div>}</div>}
    </div>
    {idx===total-1&&slide.cta?<div style={{fontSize:bsz,color:acc,fontWeight:600}}>{slide.cta}</div>:<div style={{display:"flex",gap:4}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===idx?14:5,height:5,borderRadius:3,background:i===idx?acc:"rgba(255,255,255,0.2)"}}/>)}</div>}
  </div>;
}

function SlideByType({type,slide,idx,total,sz,handle}){
  if(type==="news")return <NewsSlide slide={slide} idx={idx} total={total} sz={sz}/>;
  if(type==="data")return <DataSlide slide={slide} idx={idx} total={total} sz={sz}/>;
  if(type==="steps")return <StepsSlide slide={slide} idx={idx} total={total} sz={sz}/>;
  if(type==="quotes")return <QuoteSlide slide={slide} idx={idx} total={total} sz={sz}/>;
  return <BrandedSlide slide={slide} idx={idx} total={total} sz={sz} handle={handle}/>;
}

function parseSlides(text,type){
  const slides=[];
  for(let n=1;n<=9;n++){
    if(type==="news"){const h=gv(text,`SLIDE_${n}_HEADLINE`);if(!h)break;slides.push({headline:h,source:gv(text,`SLIDE_${n}_SOURCE`),summary:gv(text,`SLIDE_${n}_SUMMARY`),takeaway:gv(text,`SLIDE_${n}_TAKEAWAY`),cta:gv(text,`SLIDE_${n}_CTA`)});}
    else if(type==="data"){const h=gv(text,`SLIDE_${n}_HEADLINE`)||gv(text,`SLIDE_${n}_STAT`);if(!h)break;slides.push({headline:h,stat:gv(text,`SLIDE_${n}_STAT`),label:gv(text,`SLIDE_${n}_LABEL`),context:gv(text,`SLIDE_${n}_CONTEXT`)||gv(text,`SLIDE_${n}_BODY`),source:gv(text,`SLIDE_${n}_SOURCE`),cta:gv(text,`SLIDE_${n}_CTA`)});}
    else if(type==="steps"){const h=gv(text,`SLIDE_${n}_TITLE`)||gv(text,`SLIDE_${n}_HEADLINE`);if(!h)break;slides.push({headline:h,title:h,step:gv(text,`SLIDE_${n}_STEP`)||String(n),detail:gv(text,`SLIDE_${n}_DETAIL`)||gv(text,`SLIDE_${n}_BODY`),tip:gv(text,`SLIDE_${n}_TIP`),cta:gv(text,`SLIDE_${n}_CTA`)});}
    else if(type==="quotes"){const q=gv(text,`SLIDE_${n}_QUOTE`)||gv(text,`SLIDE_${n}_HEADLINE`);if(!q)break;slides.push({quote:q,headline:q,attribution:gv(text,`SLIDE_${n}_ATTRIBUTION`),role:gv(text,`SLIDE_${n}_ROLE`),body:gv(text,`SLIDE_${n}_BODY`),cta:gv(text,`SLIDE_${n}_CTA`)});}
    else{const h=gv(text,`SLIDE_${n}_HEADLINE`);if(!h)break;slides.push({headline:h,tag:gv(text,`SLIDE_${n}_TAG`),body:gv(text,`SLIDE_${n}_BODY`),cta:gv(text,`SLIDE_${n}_CTA`)});}
  }
  return slides;
}

function dlSlidePNG(slide,idx,total,type,name,handle){
  const sz=1080,cv=document.createElement("canvas");cv.width=sz;cv.height=sz;
  const ctx=cv.getContext("2d");const pad=Math.round(sz*.09);const mw=sz-pad*2;
  function wrap(text,x,y,maxW,lh,maxL){const words=(text||"").split(" ");let ln="",drawn=0;for(const w of words){const t=ln+w+" ";if(ctx.measureText(t).width>maxW&&ln){if(drawn>=(maxL||99)-1){ctx.fillText(ln.trim()+"…",x,y);return y+lh;}ctx.fillText(ln.trim(),x,y);y+=lh;ln=w+" ";drawn++;}else ln=t;}if(ln.trim())ctx.fillText(ln.trim(),x,y);return y+lh;}
  if(type==="data"){const grad=DGRADS[idx%DGRADS.length];const g=ctx.createLinearGradient(0,0,sz,sz);g.addColorStop(0,grad[0]);g.addColorStop(1,grad[1]);ctx.fillStyle=g;ctx.fillRect(0,0,sz,sz);ctx.textAlign="center";if(slide.stat){ctx.font=`900 ${Math.round(sz*.18)}px Arial`;ctx.fillStyle="rgba(255,255,255,0.9)";ctx.fillText(slide.stat,sz/2,sz*.52);}else{ctx.font=`700 ${Math.round(sz*.06)}px Georgia`;ctx.fillStyle="#fff";wrap(slide.headline,sz/2-mw/2,sz*.45,mw,sz*.075,3);}if(slide.label){ctx.font=`700 ${Math.round(sz*.028)}px Arial`;ctx.fillStyle="rgba(255,255,255,0.65)";ctx.fillText(slide.label.toUpperCase(),sz/2,sz*.62);}if(slide.context){ctx.font=`400 ${Math.round(sz*.03)}px Georgia`;ctx.fillStyle="rgba(255,255,255,0.5)";wrap(slide.context,sz/2-mw/2,sz*.7,mw,sz*.045,3);}ctx.textAlign="left";}
  else if(type==="news"){const np=NPALS[idx%NPALS.length];ctx.fillStyle="#fafaf8";ctx.fillRect(0,0,sz,sz);ctx.fillStyle=np.accent;ctx.fillRect(0,0,8,sz);ctx.font=`800 ${Math.round(sz*.022)}px Arial`;ctx.fillStyle=np.accent;ctx.fillText(handle||"CREATOR OS",pad+16,pad+28);if(slide.source){ctx.fillStyle=np.accent;ctx.beginPath();ctx.roundRect(pad+16,pad+44,ctx.measureText(slide.source.toUpperCase()).width+20,26,4);ctx.fill();ctx.font=`700 ${Math.round(sz*.02)}px Arial`;ctx.fillStyle="#fff";ctx.fillText(slide.source.toUpperCase(),pad+26,pad+62);}const hy=pad+90;ctx.font=`800 ${Math.round(sz*.055)}px Georgia`;ctx.fillStyle="#1a1a1a";wrap(slide.headline,pad+16,hy,mw-16,sz*.07,3);if(slide.summary){ctx.font=`400 ${Math.round(sz*.03)}px Georgia`;ctx.fillStyle="#555";wrap(slide.summary,pad+16,hy+230,mw-16,sz*.044,3);}if(slide.takeaway){ctx.font=`600 ${Math.round(sz*.026)}px Arial`;ctx.fillStyle=np.accent;wrap("↳ "+slide.takeaway,pad+16,sz-pad-60,mw-16,sz*.038,2);}}
  else if(type==="steps"){const acc=SACCS[idx%SACCS.length];ctx.fillStyle=idx===0?"#1a1a1a":"#fff";ctx.beginPath();ctx.roundRect(0,0,sz,sz,24);ctx.fill();if(idx!==0){ctx.font=`900 ${Math.round(sz*.28)}px Arial`;ctx.fillStyle=`${acc}10`;ctx.textAlign="right";ctx.fillText(slide.step||String(idx).padStart(2,"0"),sz-pad*.5,sz*.7);ctx.textAlign="left";ctx.fillStyle=acc;ctx.beginPath();ctx.arc(pad+36,pad+80,22,0,Math.PI*2);ctx.fill();ctx.font=`800 ${Math.round(sz*.026)}px Arial`;ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(slide.step||String(idx),pad+36,pad+88);ctx.textAlign="left";}const ty=idx===0?sz*.4:pad+130;ctx.font=`700 ${idx===0?Math.round(sz*.065):Math.round(sz*.054)}px ${idx===0?"Georgia":"Arial"}`;ctx.fillStyle=idx===0?"#fff":C.ink;wrap(slide.headline||slide.title,pad,ty,mw,sz*.07,3);if(slide.detail&&idx!==0){ctx.font=`400 ${Math.round(sz*.032)}px Arial`;ctx.fillStyle=C.muted;wrap(slide.detail,pad,ty+210,mw,sz*.045,3);}}
  else if(type==="quotes"){const qbg=QBGS[idx%QBGS.length];const qacc=QACCS[idx%QACCS.length];ctx.fillStyle=qbg;ctx.beginPath();ctx.roundRect(0,0,sz,sz,24);ctx.fill();ctx.font=`${Math.round(sz*.7)}px Georgia`;ctx.fillStyle=`${qacc}12`;ctx.fillText('"',pad*.5,sz*.6);ctx.fillStyle=qacc;ctx.fillRect(pad,Math.round(sz*.3),32,4);ctx.font=`600 ${Math.round(sz*.052)}px Georgia`;ctx.fillStyle="#fff";wrap(`"${slide.quote||slide.headline}"`,pad,sz*.42,mw,sz*.066,4);if(slide.attribution){ctx.font=`700 ${Math.round(sz*.03)}px Arial`;ctx.fillStyle=qacc;ctx.fillText(slide.attribution,pad,sz*.83);}if(slide.role){ctx.font=`400 ${Math.round(sz*.026)}px Arial`;ctx.fillStyle="rgba(255,255,255,0.45)";ctx.fillText(slide.role,pad,sz*.87);}}
  else{const p=DPALS[idx%DPALS.length];const g2=ctx.createRadialGradient(sz*.8,sz*.1,0,sz*.8,sz*.1,sz*.6);g2.addColorStop(0,p.grad);g2.addColorStop(1,p.bg);ctx.fillStyle=g2;ctx.beginPath();ctx.roundRect(0,0,sz,sz,24);ctx.fill();const gl=ctx.createLinearGradient(0,0,sz,0);gl.addColorStop(0,"transparent");gl.addColorStop(.5,p.acc+"88");gl.addColorStop(1,"transparent");ctx.fillStyle=gl;ctx.fillRect(0,0,sz,4);ctx.font=`800 ${Math.round(sz*.024)}px Arial`;ctx.fillStyle=p.acc+"80";ctx.fillText(handle||"CREATOR OS",pad,pad+28);ctx.textAlign="right";ctx.fillStyle=p.acc+"50";ctx.fillText(idx===0?"SWIPE →":`${idx+1}/${total}`,sz-pad,pad+28);ctx.textAlign="left";let y=sz*.36;if(slide.tag){ctx.font=`700 ${Math.round(sz*.024)}px Arial`;ctx.fillStyle=p.acc+"70";ctx.fillText(slide.tag.toUpperCase(),pad,y);y+=sz*.048;}const tsz=idx===0?Math.round(sz*.068):Math.round(sz*.054);ctx.font=`700 ${tsz}px Georgia`;ctx.fillStyle="#fff";y=wrap(slide.headline,pad,y,mw,tsz*1.28,4);if(slide.body){ctx.font=`400 ${Math.round(sz*.032)}px Georgia`;ctx.fillStyle="rgba(255,255,255,0.58)";wrap(slide.body,pad,y+16,mw,sz*.044,3);}}
  if(idx===total-1&&slide.cta&&type!=="news"&&type!=="steps"&&type!=="quotes"){const by=sz-pad-60;ctx.strokeStyle="rgba(255,255,255,0.25)";ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(pad,by,mw,52,8);ctx.stroke();ctx.font=`600 ${Math.round(sz*.032)}px Arial`;ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(slide.cta,sz/2,by+30);ctx.textAlign="left";}
  const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=name||`slide-${idx+1}.png`;a.click();
}
function dlAllSlides(slides,type,topic,handle){const safe=(topic||"carousel").replace(/[^a-z0-9]/gi,"-").toLowerCase().slice(0,28);slides.forEach((sl,i)=>setTimeout(()=>dlSlidePNG(sl,i,slides.length,type,`${safe}-${i+1}.png`,handle),i*300));}

function CarouselViewer({slides,type,topic,keyword,hashtags,handle}){
  const[cur,setCur]=useState(0);const[mode,setMode]=useState("play");
  if(!slides?.length)return null;
  return <div>
    <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
      <Btn onClick={()=>setMode("play")} v={mode==="play"?"dark":"ghost"} sm>▶ Preview</Btn>
      <Btn onClick={()=>setMode("all")} v={mode==="all"?"dark":"ghost"} sm>📷 All slides</Btn>
      <Btn onClick={()=>dlAllSlides(slides,type,topic,handle)} v="gold" sm>⬇ Download all PNGs</Btn>
    </div>
    {mode==="play"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <SlideByType type={type} slide={slides[cur]} idx={cur} total={slides.length} sz={290} handle={handle}/>
      <div style={{display:"flex",gap:9,alignItems:"center"}}>
        <Btn onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0} v="ghost" sm>←</Btn>
        <span style={{fontSize:12,color:C.muted}}>{cur+1}/{slides.length}</span>
        <Btn onClick={()=>setCur(c=>Math.min(slides.length-1,c+1))} disabled={cur===slides.length-1} v="ghost" sm>→</Btn>
      </div>
      <div style={{display:"flex",gap:5}}>{slides.map((_,i)=><div key={i} onClick={()=>setCur(i)} style={{width:i===cur?18:6,height:6,borderRadius:3,background:i===cur?C.ink:C.faint,cursor:"pointer"}}/>)}</div>
    </div>}
    {mode==="all"&&<div>
      <Box fill={C.goldL} ac={C.goldB} style={{marginBottom:10}}><div style={{fontSize:12,color:C.ink,lineHeight:1.7}}><strong>LinkedIn:</strong> Document post → combine at ilovepdf.com → upload PDF. <strong>Instagram:</strong> Multi-image post.</div></Box>
      <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>{slides.map((sl,i)=><div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600,letterSpacing:"0.06em"}}>SLIDE {i+1}</div><SlideByType type={type} slide={sl} idx={i} total={slides.length} sz={270} handle={handle}/></div>)}</div>
    </div>}
    {keyword&&<Box fill={C.greenL} ac={C.greenB} style={{marginTop:10}}><span style={{fontSize:12,fontWeight:600,color:C.green}}>Comment trigger: </span><strong style={{color:C.green}}>{keyword}</strong></Box>}
    {hashtags&&<div style={{fontSize:12,color:C.blue,marginTop:8}}>{hashtags}</div>}
  </div>;
}

// ─── PROMPTS ─────────────────────────────────────────────────
const CTYPES=[{id:"hot_take",label:"🔥 Hot take"},{id:"tutorial",label:"📚 Tutorial"},{id:"tool_review",label:"🔬 Tool review"},{id:"news",label:"📰 News breakdown"},{id:"myth_bust",label:"🚫 Myth busting"},{id:"i_built",label:"⚡ I built this"},{id:"comparison",label:"⚖️ Comparison"}];
const CARTYPES=[{id:"branded",label:"🌑 Branded dark"},{id:"news",label:"📰 News editorial"},{id:"data",label:"📊 Stats & data"},{id:"steps",label:"📋 Step by step"},{id:"quotes",label:"💬 Quotes"}];

function sPrompt(brand,ct,topic,day){
  const tl=topic?`Topic: ${topic}`:`Use web search. Find the best ${ct.replace("_"," ")} content right now.`;
  const g={hot_take:"[HOOK] under 10 words — surprising\n[AGITATE] uncomfortable truth 2–3 sentences\n[VALUE] insider take 4–6 specific sentences\n[PROOF] one stat\n[CTA] comment KEYWORD",tutorial:"[HOOK] promise result\n[AGITATE] why people struggle\n[VALUE] step-by-step 4–6 sentences\n[PROOF] what it unlocks\n[CTA] comment KEYWORD",tool_review:"[HOOK] tool + verdict\n[AGITATE] problem it solves\n[VALUE] 2 loved + 1 honest criticism\n[PROOF] one result\n[CTA] comment REVIEW",news:"[HOOK] what happened\n[AGITATE] why people miss the story\n[VALUE] real implications 4–6 sentences\n[PROOF] data point\n[CTA] comment KEYWORD",myth_bust:"[HOOK] state the myth\n[AGITATE] why everyone believes it\n[VALUE] the truth 4–6 sentences\n[PROOF] one fact\n[CTA] comment KEYWORD",i_built:"[HOOK] show result first\n[AGITATE] manual pain this replaces\n[VALUE] what was built step by step\n[PROOF] time saved\n[CTA] comment BUILD",comparison:"[HOOK] two things, bold claim\n[AGITATE] why picking wrong costs them\n[VALUE] honest breakdown 4–6 sentences\n[PROOF] recommendation\n[CTA] comment KEYWORD"};
  return `${brand}\n${tl}\nDay: ${day}\n\nWrite a 60–90 sec standalone video script:\n${g[ct]||g.hot_take}\n\nTOPIC: [title]\nHOOK_LINE: [first words]\nKEYWORD: [ONE word]\nASSET: [asset name]\nHASHTAGS: [10 hashtags]\nBROLL: [5 Pexels portrait-video terms]`;
}

function cPrompt(brand,ct,ctype,topic,day){
  const tl=topic?`Topic: ${topic}`:`Use web search. Find a trending ${ctype.replace("_"," ")} topic for ${day}.`;
  const f={branded:`7 branded slides:\nSLIDE_1_TAG: Cover\nSLIDE_1_HEADLINE: [bold hook max 8 words]\nSLIDE_1_BODY: [teaser]\nSLIDE_2_TAG: The problem\nSLIDE_2_HEADLINE: [max 8]\nSLIDE_2_BODY: [max 20 words]\nSLIDE_3_TAG: Insight 1\nSLIDE_3_HEADLINE: [max 8]\nSLIDE_3_BODY: [max 20]\nSLIDE_4_TAG: Insight 2\nSLIDE_4_HEADLINE: [max 8]\nSLIDE_4_BODY: [max 20]\nSLIDE_5_TAG: Insight 3\nSLIDE_5_HEADLINE: [max 8 most valuable]\nSLIDE_5_BODY: [max 20]\nSLIDE_6_TAG: The truth\nSLIDE_6_HEADLINE: [max 8 provocative]\nSLIDE_6_BODY: [max 20]\nSLIDE_7_TAG: Take action\nSLIDE_7_HEADLINE: [max 8]\nSLIDE_7_CTA: [Follow · Save · Comment KEYWORD]`,news:`7 news-editorial slides:\nSLIDE_1_HEADLINE: [headline max 8 words]\nSLIDE_1_SOURCE: [AI BRIEF/TOOL DROP/DATA ALERT]\nSLIDE_1_SUMMARY: [2 sentences]\nSLIDE_1_TAKEAWAY: [1 sentence why it matters]\nSLIDE_2_HEADLINE: ...\nSLIDE_2_SOURCE: ...\nSLIDE_2_SUMMARY: ...\nSLIDE_2_TAKEAWAY: ...\nSLIDE_3_HEADLINE: ...\nSLIDE_3_SOURCE: ...\nSLIDE_3_SUMMARY: ...\nSLIDE_3_TAKEAWAY: ...\nSLIDE_4_HEADLINE: ...\nSLIDE_4_SOURCE: ...\nSLIDE_4_SUMMARY: ...\nSLIDE_4_TAKEAWAY: ...\nSLIDE_5_HEADLINE: ...\nSLIDE_5_SOURCE: ...\nSLIDE_5_SUMMARY: ...\nSLIDE_5_TAKEAWAY: ...\nSLIDE_6_HEADLINE: ...\nSLIDE_6_SOURCE: ...\nSLIDE_6_SUMMARY: ...\nSLIDE_6_TAKEAWAY: ...\nSLIDE_7_HEADLINE: What this means for you\nSLIDE_7_SUMMARY: [2-sentence honest take]\nSLIDE_7_CTA: [Follow for weekly updates]`,data:`7 stats slides:\nSLIDE_1_STAT: [Big number e.g. $4.4T]\nSLIDE_1_LABEL: [3 words max]\nSLIDE_1_CONTEXT: [1-2 sentences]\nSLIDE_1_SOURCE: [source]\nSLIDE_2_STAT: ...\nSLIDE_2_LABEL: ...\nSLIDE_2_CONTEXT: ...\nSLIDE_2_SOURCE: ...\nSLIDE_3_STAT: ...\nSLIDE_3_LABEL: ...\nSLIDE_3_CONTEXT: ...\nSLIDE_3_SOURCE: ...\nSLIDE_4_STAT: ...\nSLIDE_4_LABEL: ...\nSLIDE_4_CONTEXT: ...\nSLIDE_4_SOURCE: ...\nSLIDE_5_STAT: ...\nSLIDE_5_LABEL: ...\nSLIDE_5_CONTEXT: ...\nSLIDE_5_SOURCE: ...\nSLIDE_6_STAT: ...\nSLIDE_6_LABEL: ...\nSLIDE_6_CONTEXT: ...\nSLIDE_6_SOURCE: ...\nSLIDE_7_HEADLINE: The takeaway\nSLIDE_7_CONTEXT: [2-sentence so-what]\nSLIDE_7_CTA: [Follow for more]`,steps:`7 tutorial slides:\nSLIDE_1_TITLE: [What they learn]\nSLIDE_1_DETAIL: [One-line promise]\nSLIDE_2_STEP: 01\nSLIDE_2_TITLE: [Step name max 6 words]\nSLIDE_2_DETAIL: [max 20 words]\nSLIDE_2_TIP: [Pro tip max 12 words]\nSLIDE_3_STEP: 02\nSLIDE_3_TITLE: ...\nSLIDE_3_DETAIL: ...\nSLIDE_3_TIP: ...\nSLIDE_4_STEP: 03\nSLIDE_4_TITLE: ...\nSLIDE_4_DETAIL: ...\nSLIDE_4_TIP: ...\nSLIDE_5_STEP: 04\nSLIDE_5_TITLE: ...\nSLIDE_5_DETAIL: ...\nSLIDE_5_TIP: ...\nSLIDE_6_STEP: 05\nSLIDE_6_TITLE: ...\nSLIDE_6_DETAIL: ...\nSLIDE_6_TIP: ...\nSLIDE_7_TITLE: You're ready\nSLIDE_7_DETAIL: [What they can now do]\nSLIDE_7_CTA: [Follow for more]`,quotes:`7 quote slides:\nSLIDE_1_QUOTE: [Powerful opening max 18 words]\nSLIDE_1_ATTRIBUTION: [name/handle]\nSLIDE_1_ROLE: [role]\nSLIDE_2_QUOTE: ...\nSLIDE_2_ATTRIBUTION: ...\nSLIDE_2_ROLE: ...\nSLIDE_3_QUOTE: ...\nSLIDE_3_ATTRIBUTION: ...\nSLIDE_3_ROLE: ...\nSLIDE_4_QUOTE: ...\nSLIDE_4_ATTRIBUTION: ...\nSLIDE_4_ROLE: ...\nSLIDE_5_QUOTE: ...\nSLIDE_5_ATTRIBUTION: ...\nSLIDE_5_ROLE: ...\nSLIDE_6_QUOTE: ...\nSLIDE_6_ATTRIBUTION: ...\nSLIDE_6_ROLE: ...\nSLIDE_7_QUOTE: [Most memorable]\nSLIDE_7_ATTRIBUTION: [name/handle]\nSLIDE_7_CTA: [Follow for more]`};
  return `${brand}\n${tl}\nDay: ${day}\n\n${f[ctype]||f.branded}\n\nTOPIC: [specific topic]\nKEYWORD: [ONE word]\nHASHTAGS: [10 hashtags]`;
}

const DAYS=[{day:"Mon",emoji:"🔥",label:"Hot take",color:C.red,colorL:C.redL,colorB:C.redB},{day:"Tue",emoji:"💡",label:"Quick tip",color:C.blue,colorL:C.blueL,colorB:C.blueB},{day:"Wed",emoji:"🔬",label:"Tool review",color:C.purple,colorL:C.purpleL,colorB:"#ddd6fe"},{day:"Thu",emoji:"🃏",label:"Carousel day",color:C.gold,colorL:C.goldL,colorB:C.goldB},{day:"Fri",emoji:"⚡",label:"I built this",color:C.green,colorL:C.greenL,colorB:C.greenB}];
const eDay=()=>({contentType:"hot_take",topic:"",carouselType:"branded",script:null,carousel:null,asset:null,textPost:null});

// ─── SETTINGS PANEL ──────────────────────────────────────────
function SettingsPanel({profile,onSave}){
  const[p,setP]=useState(profile);
  const upd=(k,v)=>setP(prev=>({...prev,[k]:v}));
  return <div>
    <Box fill={C.goldL} ac={C.goldB} style={{marginBottom:18}}>
      <div style={{fontSize:13,color:C.ink,lineHeight:1.75}}>
        Fill in your details below. Every piece of content Claude generates will be written in your voice, for your audience. Nothing here is sent anywhere except the Anthropic API when you generate content.
      </div>
    </Box>
    <Input label="Your name or handle" value={p.handle} onChange={v=>upd("handle",v)} placeholder="@yourhandle or Your Name"/>
    <Input label="Your role / expertise" value={p.role} onChange={v=>upd("role",v)} placeholder="e.g. Founder & CEO · Marketing Strategist · Fitness Coach"/>
    <Input label="Your content niche" value={p.niche} onChange={v=>upd("niche",v)} placeholder="e.g. AI for business · Personal finance · No-code tools"/>
    <Input label="Your target audience" value={p.audience} onChange={v=>upd("audience",v)} placeholder="e.g. Small business owners who want to use AI without a tech team"/>
    <Input label="Your voice / style" value={p.voice} onChange={v=>upd("voice",v)} placeholder="e.g. Direct, warm, no jargon. Short punchy sentences. Sounds like a smart friend." textarea rows={3}/>
    <Input label="Rules (what to never say or do)" value={p.rules} onChange={v=>upd("rules",v)} placeholder="e.g. Never mention clients by name. Don't use the word 'leverage'. Keep it real." textarea rows={2}/>
    <Btn onClick={()=>onSave(p)} v="gold">Save profile</Btn>
    <div style={{marginTop:8,fontSize:12,color:C.muted}}>Your profile is saved in this browser session only. It's not stored anywhere else.</div>
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App(){
  const[apiKey,setApiKey]=useState("");const[keyDraft,setKeyDraft]=useState("");const[showKey,setShowKey]=useState(false);const[showKeyTxt,setShowKeyTxt]=useState(false);
  const[profile,setProfile]=useState(DEFAULT_PROFILE);
  const[section,setSection]=useState("week");const[activeDay,setActiveDay]=useState("Mon");
  const[days,setDays]=useState(()=>DAYS.reduce((a,d)=>({...a,[d.day]:eDay()}),{}));
  const[loading,setLoading]=useState({});const[editing,setEditing]=useState({});const[revInput,setRevInput]=useState({});
  const[newsletter,setNewsletter]=useState(null);const[nlLoading,setNLLoading]=useState(false);
  const[toast,setToast]=useState(null);

  const say=(msg,t="ok")=>{setToast({msg,t});setTimeout(()=>setToast(null),3000);};
  const setL=(k,v)=>setLoading(l=>({...l,[k]:v}));
  const setE=(k,v)=>setEditing(e=>({...e,[k]:v}));
  const updDay=(day,patch)=>setDays(d=>({...d,[day]:{...d[day],...patch}}));
  const isL=k=>!!loading[k];const isE=k=>!!editing[k];
  const day=DAYS.find(d=>d.day===activeDay);const dd=days[activeDay];
  const brand=buildBrand(profile);

  const genScript=async()=>{
    if(!apiKey){say("Add your API key first","err");setShowKey(true);return;}
    const k=`${activeDay}_script`;setL(k,true);
    try{const text=await generate(sPrompt(brand,dd.contentType,dd.topic,activeDay),apiKey);
      const clean=text.replace(/^(TOPIC|HOOK_LINE|KEYWORD|ASSET|HASHTAGS|BROLL):.+$/gim,"").trim();
      updDay(activeDay,{script:{content:clean,topic:gv(text,"TOPIC"),hook:gv(text,"HOOK_LINE"),keyword:gv(text,"KEYWORD"),asset:gv(text,"ASSET"),hashtags:gv(text,"HASHTAGS"),broll:gv(text,"BROLL")}});
    }catch(e){say(e.message||"Failed","err");}setL(k,false);
  };
  const genCarousel=async()=>{
    if(!apiKey){say("Add your API key first","err");setShowKey(true);return;}
    const k=`${activeDay}_carousel`;setL(k,true);
    try{const text=await generate(cPrompt(brand,dd.carouselType,dd.contentType,dd.topic,activeDay),apiKey);
      updDay(activeDay,{carousel:{slides:parseSlides(text,dd.carouselType),type:dd.carouselType,topic:gv(text,"TOPIC"),keyword:gv(text,"KEYWORD"),hashtags:gv(text,"HASHTAGS")}});
    }catch(e){say(e.message||"Failed","err");}setL(k,false);
  };
  const genAsset=async()=>{
    if(!apiKey){say("Add your API key first","err");setShowKey(true);return;}
    const k=`${activeDay}_asset`;setL(k,true);
    try{const t=dd.script?.topic||dd.carousel?.topic||dd.topic;const kw=dd.script?.keyword||dd.carousel?.keyword;
      const text=await generate(`${brand}\nHigh-value downloadable asset. Topic: ${t||"your niche"}. Trigger: ${kw||"BUILD"}.\nMin 5 useful items. Max 600 words. Immediately actionable.\nTITLE: [title]\nFORMAT: [PDF/prompts/checklist/template]\nTAGLINE: [one sentence]\nCONTENT:\n[Write everything.]`,apiKey);
      updDay(activeDay,{asset:{content:text,title:gv(text,"TITLE"),format:gv(text,"FORMAT"),tagline:gv(text,"TAGLINE")}});
    }catch(e){say(e.message||"Failed","err");}setL(k,false);
  };
  const revise=async(field,inst)=>{
    if(!apiKey)return;const k=`${activeDay}_${field}_rev`;setL(k,true);
    const cur=field==="script"?dd.script?.content:field==="asset"?dd.asset?.content:dd.carousel?.slides?.map((s,i)=>`Slide ${i+1}: ${s.headline||s.quote||s.stat}`).join("\n");
    try{const text=await generate(`${brand}\nRevise this ${field}:\n\n${cur}\n\nInstruction: ${inst||"Make it punchier and more in their voice"}\n\nReturn full revised version same format.`,apiKey);
      if(field==="script"){const clean=text.replace(/^(TOPIC|HOOK_LINE|KEYWORD|ASSET|HASHTAGS|BROLL):.+$/gim,"").trim();updDay(activeDay,{script:{...dd.script,content:clean}});}
      else if(field==="carousel"){const slides=parseSlides(text,dd.carousel?.type||"branded");if(slides.length)updDay(activeDay,{carousel:{...dd.carousel,slides}});}
      else{updDay(activeDay,{asset:{...dd.asset,content:text,title:gv(text,"TITLE")||dd.asset?.title}});}
      setE(`${activeDay}_${field}_rev`,false);setRevInput(r=>({...r,[`${activeDay}_${field}`]:""}));say("Revised!");
    }catch(e){say(e.message||"Failed","err");}setL(k,false);
  };
  const genNL=async()=>{
    if(!apiKey){say("Add your API key first","err");setShowKey(true);return;}setNLLoading(true);
    try{const text=await generate(`${brand}\nUse web search. 5 most important developments in ${profile.niche||"your niche"} past 7 days.\nWrite a newsletter. Under 400 words.\nSUBJECT: [max 8 words]\nPREVIEW: [teaser]\nINTRO:\n[2 sentences their take]\nITEM_1_HEADLINE: [news/tool]\nITEM_1_TAKE: [2-sentence honest take]\nITEM_2_HEADLINE: ...\nITEM_2_TAKE: ...\nITEM_3_HEADLINE: ...\nITEM_3_TAKE: ...\nITEM_4_HEADLINE: ...\nITEM_4_TAKE: ...\nITEM_5_HEADLINE: ...\nITEM_5_TAKE: ...\nCLOSING:\n[1 sentence teasing next week]`,apiKey);setNewsletter(text);}
    catch(e){say(e.message||"Failed","err");}setNLLoading(false);
  };

  function ReviseBar({field}){
    const rk=`${activeDay}_${field}`;const ek=`${activeDay}_${field}_rev`;
    return <div style={{marginTop:8}}>
      {isE(ek)?<div style={{display:"flex",gap:7}}>
        <input value={revInput[rk]||""} onChange={e=>setRevInput(r=>({...r,[rk]:e.target.value}))} placeholder="How to revise? (blank = default)"
          style={{flex:1,fontSize:12,padding:"5px 10px",borderRadius:8,border:`1px solid ${C.faint}`,background:C.card,color:C.ink}}/>
        <Btn onClick={()=>revise(field,revInput[rk]||"")} disabled={isL(`${activeDay}_${field}_rev`)} v="outline" sm>{isL(`${activeDay}_${field}_rev`)?"Revising...":"Revise ↗"}</Btn>
        <Btn onClick={()=>setE(ek,false)} v="ghost" sm>✕</Btn>
      </div>:<Btn onClick={()=>setE(ek,true)} v="ghost" sm>✏️ Revise</Btn>}
    </div>;
  }

  function EditBar({field,value,onSave}){
    const ek=`${activeDay}_${field}_edit`;const[d,setD]=useState(value||"");
    if(!isE(ek))return <Btn onClick={()=>{setD(value||"");setE(ek,true);}} v="ghost" sm>✏️ Edit</Btn>;
    return <div style={{marginTop:8}}>
      <textarea value={d} onChange={e=>setD(e.target.value)} rows={7} style={{width:"100%",fontSize:13,lineHeight:1.8,fontFamily:"Georgia,serif",color:C.ink,background:C.bg,border:`1.5px solid ${C.blueB}`,borderRadius:9,padding:"10px 12px",resize:"vertical",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:8,marginTop:7}}><Btn onClick={()=>{onSave(d);setE(ek,false);}} v="green" sm>Save</Btn><Btn onClick={()=>setE(ek,false)} v="ghost" sm>Cancel</Btn></div>
    </div>;
  }

  const profileComplete=profile.handle&&profile.role&&profile.niche;

  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:"-apple-system,sans-serif"}}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}input,button,textarea,select{font-family:inherit}`}</style>
    {toast&&<div style={{position:"fixed",top:14,right:14,zIndex:9999,background:toast.t==="ok"?C.greenL:C.redL,color:toast.t==="ok"?C.green:C.red,border:`1px solid ${toast.t==="ok"?C.greenB:C.redB}`,borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:500}}>{toast.msg}</div>}

    <div style={{maxWidth:700,margin:"0 auto",padding:"20px 16px"}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.12em",color:C.gold,textTransform:"uppercase",marginBottom:3}}>{profile.handle||"Creator OS"}</div>
          <h1 style={{fontSize:24,fontWeight:700,color:C.ink,margin:0,letterSpacing:"-0.03em",fontFamily:"Georgia,serif"}}>Content OS</h1>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {apiKey&&<Chip label="✓ API active" color={C.green} bg={C.greenL}/>}
          <button onClick={()=>setShowKey(v=>!v)} style={{background:apiKey?C.greenL:C.amberL,color:apiKey?C.green:C.amber,border:`1px solid ${apiKey?C.greenB:C.amberB}`,borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>🔑 {apiKey?"Key set":"Add key"}</button>
        </div>
      </div>

      {/* API KEY */}
      {showKey&&<Box fill={C.goldL} ac={C.goldB} style={{marginBottom:16}}>
        <SL dot={C.gold}>Anthropic API key</SL>
        <p style={{fontSize:12,color:C.muted,margin:"0 0 9px",lineHeight:1.6}}><strong>console.anthropic.com</strong> → API Keys → Create Key → Add $10 credit. Pay-as-you-go. Separate from Claude Pro.</p>
        <div style={{display:"flex",gap:7}}>
          <div style={{position:"relative",flex:1}}>
            <input type={showKeyTxt?"text":"password"} value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder="sk-ant-api03-..."
              style={{width:"100%",fontSize:13,padding:"8px 42px 8px 11px",borderRadius:9,border:`1px solid ${C.faint}`,background:C.card,color:C.ink}}/>
            <button onClick={()=>setShowKeyTxt(v=>!v)} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.muted}}>{showKeyTxt?"hide":"show"}</button>
          </div>
          <Btn onClick={()=>{if(keyDraft.startsWith("sk-")){setApiKey(keyDraft);setShowKey(false);say("Key saved!");}else say("Should start with sk-ant-","err");}} v="gold">Save</Btn>
        </div>
      </Box>}

      {/* NAV */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.line}`,marginBottom:18}}>
        {[["week","📅 Week"],["newsletter","📧 Newsletter"],["settings","⚙️ My Profile"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSection(id)} style={{background:"none",border:"none",borderBottom:section===id?`2px solid ${C.ink}`:"2px solid transparent",color:section===id?C.ink:C.muted,padding:"7px 13px",fontSize:12,fontWeight:section===id?600:400,cursor:"pointer",marginBottom:-1}}>
            {label}{id==="settings"&&!profileComplete?<span style={{color:C.red,marginLeft:4}}>●</span>:null}
          </button>
        ))}
      </div>

      {/* PROFILE PROMPT */}
      {!profileComplete&&section!=="settings"&&<Box fill={C.amberL} ac={C.amberB} style={{marginBottom:16}}>
        <div style={{fontSize:13,color:C.amber,lineHeight:1.7}}>
          <strong>Fill in your profile first</strong> so Claude writes in your voice. Go to ⚙️ My Profile tab — takes 2 minutes.
        </div>
      </Box>}

      {/* SETTINGS */}
      {section==="settings"&&<SettingsPanel profile={profile} onSave={p=>{setProfile(p);say("Profile saved!");setSection("week");}}/>}

      {/* WEEK */}
      {section==="week"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:18}}>
          {DAYS.map(d=>{const has=!!(days[d.day].script||days[d.day].carousel||days[d.day].asset);return(
            <div key={d.day} onClick={()=>setActiveDay(d.day)} style={{background:activeDay===d.day?d.colorL:C.card,border:`1.5px solid ${activeDay===d.day?d.color:C.line}`,borderRadius:11,padding:"10px 8px",cursor:"pointer",textAlign:"center",position:"relative"}}>
              {has&&<div style={{position:"absolute",top:7,right:7,width:6,height:6,borderRadius:"50%",background:d.color}}/>}
              <div style={{fontSize:18,marginBottom:3}}>{d.emoji}</div>
              <div style={{fontSize:13,fontWeight:600,color:activeDay===d.day?d.color:C.ink}}>{d.day}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>{d.label}</div>
            </div>
          );})}
        </div>

        <Box fill={day.colorL} ac={day.colorB} style={{marginBottom:16}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:"1 1 150px"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Content type</div>
              <select value={dd.contentType} onChange={e=>updDay(activeDay,{contentType:e.target.value})} style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:`1px solid ${day.colorB}`,background:C.card,color:C.ink}}>
                {CTYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div style={{flex:"2 1 200px"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Topic (optional — blank = Claude searches)</div>
              <input value={dd.topic} onChange={e=>updDay(activeDay,{topic:e.target.value})} placeholder="e.g. OpenAI's latest, prompt engineering..."
                style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:`1px solid ${day.colorB}`,background:C.card,color:C.ink}}/>
            </div>
          </div>
        </Box>

        {/* SCRIPT */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SL dot={C.ink}>📝 Video script</SL>
            <div style={{display:"flex",gap:7}}>
              {dd.script&&<Btn onClick={()=>updDay(activeDay,{script:null})} v="red" sm>Clear</Btn>}
              <Btn onClick={genScript} disabled={isL(`${activeDay}_script`)} v="dark" sm>{isL(`${activeDay}_script`)?"Generating...":dd.script?"Regenerate ↗":"Generate ↗"}</Btn>
            </div>
          </div>
          {isL(`${activeDay}_script`)&&<Spin msg="Writing script..."/>}
          {!dd.script&&!isL(`${activeDay}_script`)&&<Box fill={C.bg} ac={C.faint} style={{textAlign:"center",padding:"18px"}}><div style={{fontSize:13,color:C.muted}}>No script yet</div></Box>}
          {dd.script&&!isL(`${activeDay}_script`)&&<Box>
            {dd.script.topic&&<div style={{fontSize:12,fontWeight:600,color:C.gold,marginBottom:10}}>{dd.script.topic}</div>}
            {!isE(`${activeDay}_script_edit`)&&<ScriptView text={dd.script.content}/>}
            {dd.script.hashtags&&<div style={{fontSize:12,color:C.blue,marginTop:10}}>{dd.script.hashtags}</div>}
            {dd.script.keyword&&<Box fill={C.greenL} ac={C.greenB} style={{marginTop:8}}><span style={{fontSize:12,fontWeight:600,color:C.green}}>Comment trigger: </span><strong style={{color:C.green}}>{dd.script.keyword}</strong></Box>}
            {dd.script.broll&&<Box fill={C.blueL} ac={C.blueB} style={{marginTop:8}}><SL dot={C.blue}>Pexels b-roll</SL><div style={{fontSize:12,color:C.blue}}>{dd.script.broll}</div></Box>}
            <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <Btn onClick={()=>dlScriptPNG(dd.script.content,dd.script.topic,activeDay,profile.handle)} v="gold" sm>⬇ Script PNG</Btn>
              <Btn onClick={()=>dlTxt(dd.script.content+"\n\n"+dd.script.hashtags,`${activeDay}-script.txt`)} v="outline" sm>⬇ Script TXT</Btn>
              <EditBar field="script" value={dd.script.content} onSave={v=>updDay(activeDay,{script:{...dd.script,content:v}})}/>
              <ReviseBar field="script"/>
            </div>
          </Box>}
        </div>

        {/* CAROUSEL */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SL dot={C.purple}>🃏 Carousel</SL>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
              <select value={dd.carouselType} onChange={e=>updDay(activeDay,{carouselType:e.target.value})} style={{fontSize:12,padding:"5px 9px",borderRadius:8,border:`1px solid ${C.faint}`,background:C.card,color:C.ink}}>
                {CARTYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              {dd.carousel&&<Btn onClick={()=>updDay(activeDay,{carousel:null})} v="red" sm>Clear</Btn>}
              <Btn onClick={genCarousel} disabled={isL(`${activeDay}_carousel`)} v="dark" sm>{isL(`${activeDay}_carousel`)?"Generating...":dd.carousel?"Regenerate ↗":"Generate ↗"}</Btn>
            </div>
          </div>
          {isL(`${activeDay}_carousel`)&&<Spin msg="Designing carousel..."/>}
          {!dd.carousel&&!isL(`${activeDay}_carousel`)&&<Box fill={C.bg} ac={C.faint} style={{textAlign:"center",padding:"18px"}}><div style={{fontSize:13,color:C.muted}}>No carousel yet — pick style and generate</div></Box>}
          {dd.carousel&&!isL(`${activeDay}_carousel`)&&<Box>
            {dd.carousel.topic&&<div style={{fontSize:12,fontWeight:600,color:C.gold,marginBottom:10}}>{dd.carousel.topic}</div>}
            <CarouselViewer slides={dd.carousel.slides} type={dd.carousel.type} topic={dd.carousel.topic} keyword={dd.carousel.keyword} hashtags={dd.carousel.hashtags} handle={profile.handle}/>
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.line}`}}><ReviseBar field="carousel"/></div>
          </Box>}
        </div>

        {/* LEAD MAGNET */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SL dot={C.gold}>🎁 Lead magnet</SL>
            <div style={{display:"flex",gap:7}}>
              {dd.asset&&<Btn onClick={()=>updDay(activeDay,{asset:null})} v="red" sm>Clear</Btn>}
              <Btn onClick={genAsset} disabled={isL(`${activeDay}_asset`)} v="dark" sm>{isL(`${activeDay}_asset`)?"Generating...":dd.asset?"Regenerate ↗":"Generate ↗"}</Btn>
            </div>
          </div>
          {isL(`${activeDay}_asset`)&&<Spin msg="Creating lead magnet..."/>}
          {!dd.asset&&!isL(`${activeDay}_asset`)&&<Box fill={C.bg} ac={C.faint} style={{textAlign:"center",padding:"18px"}}><div style={{fontSize:13,color:C.muted}}>No lead magnet yet</div></Box>}
          {dd.asset&&!isL(`${activeDay}_asset`)&&<Box>
            <div style={{background:"#0a0a0a",borderRadius:10,padding:"16px",marginBottom:12,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#c9a84c55,transparent)"}}/>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:"0.12em",color:"#c9a84c70",marginBottom:6,textTransform:"uppercase"}}>FREE RESOURCE</div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif",marginBottom:4}}>{dd.asset.title||"Lead Magnet"}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:10}}>{dd.asset.tagline}</div>
              {dd.asset.format&&<span style={{background:"#c9a84c",color:"#000",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5}}>{dd.asset.format}</span>}
            </div>
            {!isE(`${activeDay}_asset_edit`)&&<div style={{fontSize:13,color:C.ink,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:200,overflowY:"auto",fontFamily:"Georgia,serif"}}>{dd.asset.content?.match(/CONTENT:\s*([\s\S]+)/i)?.[1]||dd.asset.content}</div>}
            <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <Btn onClick={()=>dlAssetTxt(dd.asset.content)} v="gold" sm>⬇ Download TXT</Btn>
              <Btn onClick={()=>{navigator.clipboard?.writeText(dd.asset.content?.match(/CONTENT:\s*([\s\S]+)/i)?.[1]||dd.asset.content);say("Copied!");}} v="outline" sm>Copy</Btn>
              <EditBar field="asset" value={dd.asset.content} onSave={v=>updDay(activeDay,{asset:{...dd.asset,content:v}})}/>
              <ReviseBar field="asset"/>
            </div>
          </Box>}
        </div>

        {/* TEXT POST */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SL dot={C.blue}>💬 LinkedIn text post</SL>
            {dd.script&&<Btn onClick={async()=>{
              if(!apiKey)return;const k=`${activeDay}_tp`;setL(k,true);
              try{const text=await generate(`${brand}\nAdapt this video script into a LinkedIn text post. Max 120 words. Punchy. One idea.\nScript: ${dd.script.content}\nKeep the keyword ${dd.script.keyword||"BUILD"} in the CTA.\nAdd 5 hashtags at the end.`,apiKey);
                updDay(activeDay,{textPost:{content:text,hashtags:dd.script?.hashtags}});
              }catch(e){say(e.message||"Failed","err");}setL(k,false);
            }} disabled={isL(`${activeDay}_tp`)} v="dark" sm>{isL(`${activeDay}_tp`)?"Generating...":dd.textPost?"Regenerate ↗":"Generate from script ↗"}</Btn>}
          </div>
          {!dd.script&&<Box fill={C.bg} ac={C.faint} style={{textAlign:"center",padding:"14px"}}><div style={{fontSize:12,color:C.muted}}>Generate a script first</div></Box>}
          {dd.textPost&&<Box>
            <p style={{fontSize:14,lineHeight:1.9,color:C.ink,fontFamily:"Georgia,serif",margin:"0 0 10px",whiteSpace:"pre-wrap"}}>{dd.textPost.content}</p>
            <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <Btn onClick={()=>dlTextPostPNG(dd.textPost.content,dd.textPost.hashtags,profile.handle)} v="gold" sm>⬇ Post PNG</Btn>
              <Btn onClick={()=>dlTxt(dd.textPost.content,`${activeDay}-post.txt`)} v="outline" sm>⬇ Post TXT</Btn>
              <Btn onClick={()=>{navigator.clipboard?.writeText(dd.textPost.content);say("Copied!");}} v="ghost" sm>Copy</Btn>
            </div>
          </Box>}
        </div>
      </>}

      {/* NEWSLETTER */}
      {section==="newsletter"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <Btn onClick={genNL} disabled={nlLoading||!apiKey} v="gold">{nlLoading?"Generating...":newsletter?"Regenerate ↗":"Generate this week's newsletter ↗"}</Btn>
          {newsletter&&<Btn onClick={()=>dlNewsletterTxt(newsletter)} v="dark" sm>⬇ Download TXT</Btn>}
          {newsletter&&<Btn onClick={()=>{navigator.clipboard?.writeText(newsletter);say("Copied!");}} v="outline" sm>Copy to Beehiiv</Btn>}
          {newsletter&&<Btn onClick={()=>setNewsletter(null)} v="red" sm>Clear</Btn>}
        </div>
        {nlLoading&&<Spin msg="Researching this week's news..."/>}
        {!newsletter&&!nlLoading&&<Box fill={C.goldL} ac={C.goldB}><SL dot={C.gold}>Weekly newsletter</SL><div style={{fontSize:13,color:C.ink,lineHeight:1.75}}>5 items in your niche. Your honest 2-sentence take on each. Under 400 words. Copy into Beehiiv or any email tool.</div></Box>}
        {newsletter&&!nlLoading&&<div>
          <Box fill={C.goldL} ac={C.goldB} style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:3,letterSpacing:"0.08em"}}>SUBJECT</div>
            <div style={{fontSize:16,fontWeight:600,color:C.ink}}>{gv(newsletter,"SUBJECT")}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>Preview: {gv(newsletter,"PREVIEW")}</div>
          </Box>
          <Box style={{marginBottom:12}}>
            <div style={{fontSize:14,color:C.ink,lineHeight:1.9,fontFamily:"Georgia,serif",fontStyle:"italic",marginBottom:14}}>{gb(newsletter,"INTRO")}</div>
            <HR/>
            {[1,2,3,4,5].map(n=>{const h=gv(newsletter,`ITEM_${n}_HEADLINE`);const t=gv(newsletter,`ITEM_${n}_TAKE`);if(!h)return null;return<div key={n} style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:3}}>{n}. {h}</div><div style={{fontSize:13,color:C.muted,lineHeight:1.75,fontStyle:"italic"}}>{t}</div></div>;})}
            <HR/>
            <div style={{fontSize:13,color:C.ink,fontStyle:"italic",lineHeight:1.75}}>{gb(newsletter,"CLOSING")}</div>
          </Box>
        </div>}
      </div>}
    </div>
  </div>;
}
