// Galeria HTML Content Secure: templates
// Para incluir um template novo, acrescente um objeto ao fim do array T.
// Campos:
//   id (único), nome, cat (KPIs | Barras | SVG | Listas | Status), desc, req (o que trocar no modelo)
//   opts: quais personalizações o template aceita: 'titulo', 'unidade', 'abrev', 'sentido', 'faixas'
//   def:  valores padrão das personalizações, ex.: { titulo: 'Vendas', unidade: 'R$' }
//   html(d, o): prévia com dados de exemplo d = { s, meta, vendas, aa, varp } e opções o
//   dax(o):     a medida DAX gerada com as opções o
// Opções o = { titulo, unidade, abrev ('nao'|'mil'|'mi'|'auto'), inv (true = menor é melhor), lim1, lim2 (% para âmbar e verde) }
// Veja CONTRIBUTING.md para os helpers (hv/dv, scoreD/corD, bomD etc.).

const n0=v=>Math.round(v).toLocaleString('pt-BR');
const pc=(v,d=1)=>(v*100).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})+'%';
const f=v=>(+v).toFixed(2);
const MES=[0.78,0.84,0.8,0.9,0.86,0.95,0.91,0.98,0.94,1.02,0.97];
const CATS=[['Bebidas',412000,380000],['Mercearia',356000,371000],['Limpeza',248000,229000],['Hortifrúti',187000,176000],['Padaria',121000,133000],['Frios',98000,90000]];
const card="font-family:Segoe UI,sans-serif;padding:16px 20px;border-radius:12px;background:#ffffff;border:1px solid #e6e6e6";
const COR={bom:'#0f9d58',aten:'#f9ab00',ruim:'#d93025'};
const OPT_DEF={titulo:'',unidade:'',abrev:'nao',inv:false,lim1:80,lim2:100};

// Texto: hx escapa para HTML (prévia); tx escapa para dentro de uma string DAX
const hx=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;');
const tx=s=>hx(s).replace(/"/g,'""');
const prefixo=u=>/^(R\$|US\$|\$|€|£)$/.test(u);

// Valor formatado com unidade e abreviação: hv na prévia, dv gera a expressão DAX
function hv(v,o){
  const a=o.abrev,av=Math.abs(v),d1=x=>x.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
  const s=a=='mil'?d1(v/1e3)+' mil':a=='mi'?d1(v/1e6)+' mi':a=='auto'?(av>=1e9?d1(v/1e9)+' bi':av>=1e6?d1(v/1e6)+' mi':av>=1e3?d1(v/1e3)+' mil':n0(v)):n0(v);
  const u=String(o.unidade||'').trim();
  return !u?s:prefixo(u)?hx(u)+' '+s:s+' '+hx(u);
}
function dv(x,o){
  const a=o.abrev;
  const s=a=='mil'?`FORMAT ( ${x} / 1E3, "#,0.0" ) & " mil"`
    :a=='mi'?`FORMAT ( ${x} / 1E6, "#,0.0" ) & " mi"`
    :a=='auto'?`SWITCH ( TRUE (), ABS ( ${x} ) >= 1E9, FORMAT ( ${x} / 1E9, "#,0.0" ) & " bi", ABS ( ${x} ) >= 1E6, FORMAT ( ${x} / 1E6, "#,0.0" ) & " mi", ABS ( ${x} ) >= 1E3, FORMAT ( ${x} / 1E3, "#,0.0" ) & " mil", FORMAT ( ${x}, "#,0" ) )`
    :`FORMAT ( ${x}, "#,0" )`;
  const u=String(o.unidade||'').trim();
  return !u?s:prefixo(u)?`"${tx(u)} " & ${s}`:`${s} & " ${tx(u)}"`;
}

// Sentido e faixas. Maior é melhor: score = real / meta. Menor é melhor: score = meta / real.
// Verde quando score >= lim2, âmbar quando >= lim1, vermelho abaixo.
const lit=p=>String(+(p/100).toFixed(4));
const scoreH=(real,meta,o)=>o.inv?meta/real:real/meta;
const corH=(s,o)=>s>=o.lim2/100?COR.bom:s>=o.lim1/100?COR.aten:COR.ruim;
const scoreD=o=>o.inv?'DIVIDE ( _meta, _real )   -- menor é melhor: abaixo da meta é bom':'DIVIDE ( _real, _meta )';
const corD=o=>`SWITCH ( TRUE (), _score >= ${lit(o.lim2)}, "${COR.bom}", _score >= ${lit(o.lim1)}, "${COR.aten}", "${COR.ruim}" )`;
// Variação: maior é melhor = subir é bom; menor é melhor = cair é bom
const bomH=(v,o)=>o.inv?v<=0:v>=0;
const bomD=(x,o)=>o.inv?`${x} <= 0   -- menor é melhor: queda é boa`:`${x} >= 0`;

const T=[
{id:'kpi',nome:'KPI com variação',cat:'KPIs',desc:'Valor principal com seta e % contra o ano anterior.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code>',
opts:['titulo','unidade','abrev','sentido'],def:{titulo:'Vendas',unidade:'R$'},
html:(d,o)=>{const c=bomH(d.varp,o)?COR.bom:COR.ruim;return `<div style='${card};min-width:220px'><div style='font-size:13px;color:#605e5c'>${hx(o.titulo)}</div><div style='font-size:34px;font-weight:600;color:#252423;line-height:1.1'>${hv(d.vendas,o)}</div><div style='font-size:13px;margin-top:6px;color:${c}'>${d.varp>=0?'▲':'▼'} ${pc(Math.abs(d.varp))} <span style='color:#605e5c'>vs ano anterior</span></div></div>`},
dax:o=>`HTML KPI Variação =
VAR _atual = [Vendas]
VAR _anterior = [Vendas AA]
VAR _var = DIVIDE ( _atual - _anterior, _anterior )
VAR _bom = ${bomD('_var',o)}
VAR _cor = IF ( _bom, "${COR.bom}", "${COR.ruim}" )
VAR _seta = IF ( _var >= 0, "▲", "▼" )
RETURN
"<div style='${card}'>" &
  "<div style='font-size:13px;color:#605e5c'>${tx(o.titulo)}</div>" &
  "<div style='font-size:34px;font-weight:600;color:#252423;line-height:1.1'>" & ${dv('_atual',o)} & "</div>" &
  "<div style='font-size:13px;margin-top:6px;color:" & _cor & "'>" & _seta & " " & FORMAT ( ABS ( _var ), "0.0%" ) &
  " <span style='color:#605e5c'>vs ano anterior</span></div>" &
"</div>"`},

{id:'meta',nome:'KPI com meta e progresso',cat:'Barras',desc:'Barra que muda de cor por faixa: verde, âmbar, vermelho.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
opts:['titulo','unidade','abrev','sentido','faixas'],def:{titulo:'Vendas vs meta',unidade:'R$'},
html:(d,o)=>{const p=d.s,c=corH(scoreH(d.vendas,d.meta,o),o);return `<div style='${card};min-width:240px'><div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c'><span>${hx(o.titulo)}</span><b style='color:${c}'>${pc(p,0)}</b></div><div style='font-size:28px;font-weight:600;color:#252423;margin:4px 0 10px'>${hv(d.vendas,o)}</div><div style='height:10px;background:#edebe9;border-radius:99px;overflow:hidden'><div style='height:100%;width:${(Math.min(p,1)*100).toFixed(1)}%;background:${c};border-radius:99px'></div></div><div style='font-size:12px;color:#605e5c;margin-top:6px'>Meta: ${hv(d.meta,o)}</div></div>`},
dax:o=>`HTML KPI Meta =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _pct = DIVIDE ( _real, _meta )
VAR _score = ${scoreD(o)}
VAR _larg = MIN ( _pct, 1 ) * 100
VAR _cor = ${corD(o)}
RETURN
"<div style='${card}'>" &
  "<div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c'>" &
    "<span>${tx(o.titulo)}</span><b style='color:" & _cor & "'>" & FORMAT ( _pct, "0%" ) & "</b></div>" &
  "<div style='font-size:28px;font-weight:600;color:#252423;margin:4px 0 10px'>" & ${dv('_real',o)} & "</div>" &
  "<div style='height:10px;background:#edebe9;border-radius:99px;overflow:hidden'>" &
    "<div style='height:100%;width:" & FORMAT ( _larg, "0.0", "en-US" ) & "%;background:" & _cor & ";border-radius:99px'></div></div>" &
  "<div style='font-size:12px;color:#605e5c;margin-top:6px'>Meta: " & ${dv('_meta',o)} & "</div>" &
"</div>"`},

{id:'gauge',nome:'Gauge semicircular',cat:'SVG',desc:'Arco SVG preenchido pelo % da meta, com cor por faixa.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
opts:['titulo','sentido','faixas'],def:{titulo:'da meta'},
html:(d,o)=>{const p=d.s,c=corH(scoreH(d.vendas,d.meta,o),o);return `<svg viewBox='0 0 120 80' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'><path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#edebe9' stroke-width='12' stroke-linecap='round'/><path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='${c}' stroke-width='12' stroke-linecap='round' stroke-dasharray='${f(Math.min(p,1)*157.08)} 200'/><text x='60' y='56' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>${pc(p,0)}</text><text x='60' y='77' text-anchor='middle' font-size='7' fill='#605e5c'>${hx(o.titulo)}</text></svg>`},
dax:o=>`HTML Gauge =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _pct = DIVIDE ( _real, _meta )
VAR _score = ${scoreD(o)}
VAR _cor = ${corD(o)}
VAR _preench = MIN ( _pct, 1 ) * 157.08   -- comprimento do arco (pi * raio 50)
RETURN
"<svg viewBox='0 0 120 80' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'>" &
  "<path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#edebe9' stroke-width='12' stroke-linecap='round'/>" &
  "<path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='" & _cor & "' stroke-width='12' stroke-linecap='round' " &
    "stroke-dasharray='" & FORMAT ( _preench, "0.00", "en-US" ) & " 200'/>" &
  "<text x='60' y='56' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>" & FORMAT ( _pct, "0%" ) & "</text>" &
  "<text x='60' y='77' text-anchor='middle' font-size='7' fill='#605e5c'>${tx(o.titulo)}</text>" &
"</svg>"`},

{id:'donut',nome:'Donut de percentual',cat:'SVG',desc:'Anel com o % no centro. Bom para concluído/total.',req:'<code>[Concluídos]</code>, <code>[Total]</code>',
opts:['titulo'],def:{titulo:'concluído'},
html:(d,o)=>{const p=Math.min(d.s,1)*.86,c=251.33;return `<svg viewBox='0 0 100 100' width='100%' style='max-width:150px;font-family:Segoe UI,sans-serif'><circle cx='50' cy='50' r='40' fill='none' stroke='#edebe9' stroke-width='10'/><circle cx='50' cy='50' r='40' fill='none' stroke='#6b007b' stroke-width='10' stroke-linecap='round' stroke-dasharray='${f(p*c)} ${f(c)}' transform='rotate(-90 50 50)'/><text x='50' y='52' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>${pc(p,0)}</text><text x='50' y='64' text-anchor='middle' font-size='7' fill='#605e5c'>${hx(o.titulo)}</text></svg>`},
dax:o=>`HTML Donut =
VAR _pct = MIN ( DIVIDE ( [Concluídos], [Total] ), 1 )
VAR _circ = 251.33   -- circunferência (2 * pi * raio 40)
RETURN
"<svg viewBox='0 0 100 100' width='100%' style='max-width:150px;font-family:Segoe UI,sans-serif'>" &
  "<circle cx='50' cy='50' r='40' fill='none' stroke='#edebe9' stroke-width='10'/>" &
  "<circle cx='50' cy='50' r='40' fill='none' stroke='#6b007b' stroke-width='10' stroke-linecap='round' " &
    "stroke-dasharray='" & FORMAT ( _pct * _circ, "0.00", "en-US" ) & " " & FORMAT ( _circ, "0.00", "en-US" ) & "' " &
    "transform='rotate(-90 50 50)'/>" &
  "<text x='50' y='52' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>" & FORMAT ( _pct, "0%" ) & "</text>" &
  "<text x='50' y='64' text-anchor='middle' font-size='7' fill='#605e5c'>${tx(o.titulo)}</text>" &
"</svg>"`},

{id:'spark',nome:'Card com sparkline',cat:'SVG',desc:'Valor do período com linha dos últimos meses desenhada em SVG.',req:'<code>[Vendas]</code> e a coluna <code>\'Calendario\'[AnoMes]</code> (inteiro, ex.: 202611). Filtre a página ou o visual para o período desejado, como os últimos 12 meses.',
opts:['titulo','unidade','abrev'],def:{titulo:'Vendas no mês',unidade:'R$'},
html:(d,o)=>{const v=[...MES.map(x=>x*1e6),d.vendas],mn=Math.min(...v),mx=Math.max(...v),r=mx-mn||1,n=v.length;const pts=v.map((y,i)=>f(i/(n-1)*196+2)+','+f(48-(y-mn)/r*44)).join(' ');const ly=48-(v[n-1]-mn)/r*44;return `<div style='${card};min-width:240px'><div style='font-size:13px;color:#605e5c'>${hx(o.titulo)}</div><div style='font-size:28px;font-weight:600;color:#252423;margin-bottom:8px'>${hv(d.vendas,o)}</div><svg viewBox='0 0 200 50' width='100%' height='50'><polyline points='${pts}' fill='none' stroke='#118dff' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/><circle cx='198' cy='${f(ly)}' r='3' fill='#118dff'/></svg></div>`},
dax:o=>`HTML Sparkline =
VAR _tab = ADDCOLUMNS ( VALUES ( 'Calendario'[AnoMes] ), "@v", [Vendas] )
VAR _n = COUNTROWS ( _tab )
VAR _min = MINX ( _tab, [@v] )
VAR _max = MAXX ( _tab, [@v] )
VAR _rng = IF ( _max = _min, 1, _max - _min )
VAR _pts = ADDCOLUMNS ( _tab, "@i", RANKX ( _tab, 'Calendario'[AnoMes], , ASC ) )
VAR _linha =
    CONCATENATEX (
        _pts,
        FORMAT ( ( [@i] - 1 ) / MAX ( _n - 1, 1 ) * 196 + 2, "0.0", "en-US" ) & "," &
        FORMAT ( 48 - ( [@v] - _min ) / _rng * 44, "0.0", "en-US" ),
        " ", [@i], ASC
    )
VAR _ultimo = MAXX ( TOPN ( 1, _pts, [@i], DESC ), [@v] )
VAR _yUlt = 48 - ( _ultimo - _min ) / _rng * 44
RETURN
"<div style='${card}'>" &
  "<div style='font-size:13px;color:#605e5c'>${tx(o.titulo)}</div>" &
  "<div style='font-size:28px;font-weight:600;color:#252423;margin-bottom:8px'>" & ${dv('_ultimo',o)} & "</div>" &
  "<svg viewBox='0 0 200 50' width='100%' height='50'>" &
    "<polyline points='" & _linha & "' fill='none' stroke='#118dff' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/>" &
    "<circle cx='198' cy='" & FORMAT ( _yUlt, "0.0", "en-US" ) & "' r='3' fill='#118dff'/>" &
  "</svg>" &
"</div>"`},

{id:'rank',nome:'Ranking com barras',cat:'Listas',desc:'Top 5 categorias com barras proporcionais ao maior valor.',req:'<code>[Vendas]</code> e a coluna <code>\'Produto\'[Categoria]</code>',
opts:['titulo','unidade','abrev'],def:{titulo:'Top 5 categorias',unidade:''},
html:(d,o)=>{const t=CATS.slice(0,5).map(c=>[c[0],c[1]*(c[0]=='Bebidas'?d.s/0.92:1)]).sort((a,b)=>b[1]-a[1]),mx=t[0][1];return `<div style='font-family:Segoe UI,sans-serif;font-size:13px;color:#252423;width:100%;max-width:300px'>${o.titulo?`<div style='font-weight:600;font-size:14px;margin-bottom:12px'>${hx(o.titulo)}</div>`:''}${t.map(c=>`<div style='margin:0 0 10px'><div style='display:flex;justify-content:space-between;margin-bottom:4px'><span>${c[0]}</span><b>${hv(c[1],o)}</b></div><div style='height:8px;background:#edebe9;border-radius:99px'><div style='height:8px;border-radius:99px;background:#118dff;width:${(c[1]/mx*100).toFixed(1)}%'></div></div></div>`).join('')}</div>`},
dax:o=>`HTML Ranking =
VAR _top =
    TOPN ( 5, ADDCOLUMNS ( VALUES ( 'Produto'[Categoria] ), "@v", [Vendas] ), [@v], DESC )
VAR _max = MAXX ( _top, [@v] )
RETURN
"<div style='font-family:Segoe UI,sans-serif;font-size:13px;color:#252423'>" &${o.titulo?`
  "<div style='font-weight:600;font-size:14px;margin-bottom:12px'>${tx(o.titulo)}</div>" &`:''}
CONCATENATEX (
    _top,
    "<div style='margin:0 0 10px'>" &
      "<div style='display:flex;justify-content:space-between;margin-bottom:4px'>" &
        "<span>" & 'Produto'[Categoria] & "</span><b>" & ${dv('[@v]',o)} & "</b></div>" &
      "<div style='height:8px;background:#edebe9;border-radius:99px'>" &
        "<div style='height:8px;border-radius:99px;background:#118dff;width:" &
        FORMAT ( DIVIDE ( [@v], _max ) * 100, "0.0", "en-US" ) & "%'></div></div>" &
    "</div>",
    "", [@v], DESC
) &
"</div>"`},

{id:'status',nome:'Status com pulso',cat:'Status',desc:'Pílula de semáforo com ponto pulsando via @keyframes.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
opts:['sentido','faixas'],def:{},
html:(d,o)=>{const s=scoreH(d.vendas,d.meta,o),k=s>=o.lim2/100?0:s>=o.lim1/100?1:2,st=['No alvo','Atenção','Crítico'][k],c=['#0f9d58','#e37400','#d93025'][k],bg=['#e6f4ea','#fef3e0','#fce8e6'][k];return `<style>@keyframes pulso{0%{box-shadow:0 0 0 0 ${c}88}70%{box-shadow:0 0 0 8px ${c}00}100%{box-shadow:0 0 0 0 ${c}00}}</style><span style='display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;background:${bg};color:${c};font:600 13px Segoe UI,sans-serif'><span style='width:8px;height:8px;border-radius:50%;background:${c};animation:pulso 1.8s infinite'></span>${st}</span>`},
dax:o=>{const a=lit(o.lim2),b=lit(o.lim1);return `HTML Status =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _score = ${scoreD(o)}
VAR _txt = SWITCH ( TRUE (), _score >= ${a}, "No alvo", _score >= ${b}, "Atenção", "Crítico" )
VAR _cor = SWITCH ( TRUE (), _score >= ${a}, "#0f9d58", _score >= ${b}, "#e37400", "#d93025" )
VAR _fundo = SWITCH ( TRUE (), _score >= ${a}, "#e6f4ea", _score >= ${b}, "#fef3e0", "#fce8e6" )
RETURN
"<style>@keyframes pulso{" &
  "0%{box-shadow:0 0 0 0 " & _cor & "88}" &
  "70%{box-shadow:0 0 0 8px " & _cor & "00}" &
  "100%{box-shadow:0 0 0 0 " & _cor & "00}}</style>" &
"<span style='display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;" &
  "background:" & _fundo & ";color:" & _cor & ";font:600 13px Segoe UI,sans-serif'>" &
  "<span style='width:8px;height:8px;border-radius:50%;background:" & _cor & ";animation:pulso 1.8s infinite'></span>" &
  _txt &
"</span>"`}},

{id:'bullet',nome:'Bullet chart',cat:'SVG',desc:'Realizado sobre faixas de desempenho, com a meta marcada.',req:'<code>[Vendas]</code>, <code>[Meta]</code>. As faixas seguem os limites de âmbar e verde.',
opts:['titulo','sentido','faixas'],def:{titulo:'Vendas'},
html:(d,o)=>{const l1=o.lim1/100,l2=o.lim2/100,m=d.meta;let e,base,w1,w2,top;if(o.inv){e=Math.max(d.vendas,m/l1)*1.1;base='#a19f9d';w1=m/l1;top='#e1dfdd';w2=m/l2}else{e=Math.max(d.vendas,m)*1.2;base='#e1dfdd';w1=m*l2;top='#a19f9d';w2=m*l1}const x=v=>f(v/e*240);return `<div style='font-family:Segoe UI,sans-serif;width:100%;max-width:320px'><div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c;margin-bottom:4px'><span>${hx(o.titulo)}</span><span><b style='color:#252423'>${pc(d.s,0)}</b> da meta</span></div><svg viewBox='0 0 240 40' width='100%'><rect x='0' y='8' width='240' height='24' fill='${base}'/><rect x='0' y='8' width='${x(w1)}' height='24' fill='#c8c6c4'/><rect x='0' y='8' width='${x(w2)}' height='24' fill='${top}'/><rect x='0' y='15' width='${x(d.vendas)}' height='10' fill='#252423'/><rect x='${f(m/e*240-1.25)}' y='4' width='2.5' height='32' fill='#d93025'/></svg></div>`},
dax:o=>{const l1=lit(o.lim1),l2=lit(o.lim2);const faixas=o.inv?
`VAR _escala = MAX ( _real, DIVIDE ( _meta, ${l1} ) ) * 1.1
VAR _fAten = DIVIDE ( DIVIDE ( _meta, ${l1} ), _escala ) * 240   -- até aqui: atenção
VAR _fBom = DIVIDE ( DIVIDE ( _meta, ${l2} ), _escala ) * 240    -- até aqui: bom (menor é melhor)`:
`VAR _escala = MAX ( _real, _meta ) * 1.2
VAR _fAten = DIVIDE ( _meta * ${l2}, _escala ) * 240   -- até aqui: atenção
VAR _fRuim = DIVIDE ( _meta * ${l1}, _escala ) * 240   -- até aqui: ruim`;
const [base,top,wTop]=o.inv?['#a19f9d','#e1dfdd','_fBom']:['#e1dfdd','#a19f9d','_fRuim'];
return `HTML Bullet =
VAR _real = [Vendas]
VAR _meta = [Meta]
${faixas}
VAR _wReal = DIVIDE ( _real, _escala ) * 240
VAR _xMeta = DIVIDE ( _meta, _escala ) * 240 - 1.25
RETURN
"<div style='font-family:Segoe UI,sans-serif'>" &
  "<div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c;margin-bottom:4px'>" &
    "<span>${tx(o.titulo)}</span><span><b style='color:#252423'>" & FORMAT ( DIVIDE ( _real, _meta ), "0%" ) & "</b> da meta</span></div>" &
  "<svg viewBox='0 0 240 40' width='100%'>" &
    "<rect x='0' y='8' width='240' height='24' fill='${base}'/>" &
    "<rect x='0' y='8' width='" & FORMAT ( _fAten, "0.00", "en-US" ) & "' height='24' fill='#c8c6c4'/>" &
    "<rect x='0' y='8' width='" & FORMAT ( ${wTop}, "0.00", "en-US" ) & "' height='24' fill='${top}'/>" &
    "<rect x='0' y='15' width='" & FORMAT ( _wReal, "0.00", "en-US" ) & "' height='10' fill='#252423'/>" &
    "<rect x='" & FORMAT ( _xMeta, "0.00", "en-US" ) & "' y='4' width='2.5' height='32' fill='#d93025'/>" &
  "</svg>" &
"</div>"`}},

{id:'alerta',nome:'Alerta com texto dinâmico',cat:'Status',desc:'Mensagem que muda de tom e de texto conforme o resultado.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code>',
opts:['titulo','sentido'],def:{titulo:'Vendas'},
html:(d,o)=>{const ok=bomH(d.varp,o),c=ok?COR.bom:COR.ruim,bg=ok?'#e6f4ea':'#fce8e6',msg=`${hx(o.titulo)} ${pc(Math.abs(d.varp))} ${d.varp>=0?'acima':'abaixo'} do ano anterior.${ok?'':' Vale investigar a causa.'}`;return `<div style='display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:10px;background:${bg};border-left:4px solid ${c};font:14px/1.45 Segoe UI,sans-serif;color:#252423;max-width:340px'><svg width='20' height='20' viewBox='0 0 20 20' style='flex:none'><circle cx='10' cy='10' r='9' fill='${c}'/><text x='10' y='14.5' text-anchor='middle' font-size='13' font-weight='700' fill='#fff'>${ok?'✓':'!'}</text></svg><div><b>${ok?'Bom desempenho':'Atenção'}</b><br>${msg}</div></div>`},
dax:o=>`HTML Alerta =
VAR _var = DIVIDE ( [Vendas] - [Vendas AA], [Vendas AA] )
VAR _bom = ${bomD('_var',o)}
VAR _cor = IF ( _bom, "${COR.bom}", "${COR.ruim}" )
VAR _fundo = IF ( _bom, "#e6f4ea", "#fce8e6" )
VAR _msg =
    "${tx(o.titulo)} " & FORMAT ( ABS ( _var ), "0.0%" ) & IF ( _var >= 0, " acima", " abaixo" ) & " do ano anterior." &
    IF ( _bom, "", " Vale investigar a causa." )
RETURN
"<div style='display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:10px;" &
  "background:" & _fundo & ";border-left:4px solid " & _cor & ";font:14px/1.45 Segoe UI,sans-serif;color:#252423'>" &
  "<svg width='20' height='20' viewBox='0 0 20 20' style='flex:none'>" &
    "<circle cx='10' cy='10' r='9' fill='" & _cor & "'/>" &
    "<text x='10' y='14.5' text-anchor='middle' font-size='13' font-weight='700' fill='#fff'>" & IF ( _bom, "✓", "!" ) & "</text></svg>" &
  "<div><b>" & IF ( _bom, "Bom desempenho", "Atenção" ) & "</b><br>" & _msg & "</div>" &
"</div>"`},

{id:'etapas',nome:'Linha de etapas',cat:'Status',desc:'Stepper de processo: pedido, aprovação, separação, transporte, entrega.',req:'<code>[Etapa Atual]</code>, um número de 1 a 5. Os nomes das etapas ficam no DATATABLE.',
opts:[],def:{},
html:d=>{const e=Math.max(1,Math.min(5,Math.round((d.s-.4)/.9*4)+1)),N=['Pedido','Aprovação','Separação','Transporte','Entregue'];return `<div style='display:flex;font:12px Segoe UI,sans-serif;color:#605e5c;width:100%;max-width:340px'>${N.map((nm,i)=>{const n=i+1,ok=n<=e;return `<div style='flex:1;text-align:center;position:relative'>${n>1?`<div style='position:absolute;top:13px;right:50%;width:100%;height:3px;background:${ok?'#118dff':'#e1dfdd'}'></div>`:''}<div style='position:relative;z-index:1;box-sizing:border-box;width:28px;height:28px;margin:0 auto 6px;border-radius:50%;background:${ok?'#118dff':'#ffffff'};border:2px solid ${ok?'#118dff':'#c8c6c4'};color:${ok?'#ffffff':'#a19f9d'};font-weight:600;line-height:24px'>${n}</div><div style='${n==e?'color:#252423;font-weight:600':''}'>${nm}</div></div>`}).join('')}</div>`},
dax:()=>`HTML Etapas =
VAR _etapa = [Etapa Atual]
VAR _etapas =
    DATATABLE (
        "n", INTEGER, "nome", STRING,
        { { 1, "Pedido" }, { 2, "Aprovação" }, { 3, "Separação" }, { 4, "Transporte" }, { 5, "Entregue" } }
    )
RETURN
"<div style='display:flex;font:12px Segoe UI,sans-serif;color:#605e5c'>" &
CONCATENATEX (
    _etapas,
    VAR _feito = [n] <= _etapa
    RETURN
    "<div style='flex:1;text-align:center;position:relative'>" &
      IF ( [n] > 1,
        "<div style='position:absolute;top:13px;right:50%;width:100%;height:3px;background:" &
        IF ( _feito, "#118dff", "#e1dfdd" ) & "'></div>" ) &
      "<div style='position:relative;z-index:1;box-sizing:border-box;width:28px;height:28px;margin:0 auto 6px;border-radius:50%;" &
        "background:" & IF ( _feito, "#118dff", "#ffffff" ) & ";border:2px solid " & IF ( _feito, "#118dff", "#c8c6c4" ) &
        ";color:" & IF ( _feito, "#ffffff", "#a19f9d" ) & ";font-weight:600;line-height:24px'>" & [n] & "</div>" &
      "<div style='" & IF ( [n] = _etapa, "color:#252423;font-weight:600" ) & "'>" & [nome] & "</div>" &
    "</div>",
    "", [n], ASC
) &
"</div>"`},

{id:'tabela',nome:'Tabela com mini-barras',cat:'Listas',desc:'Top 6 com valor, variação colorida e barra embutida.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code> e a coluna <code>\'Produto\'[Categoria]</code>',
opts:['titulo','unidade','abrev','sentido'],def:{titulo:'Vendas',unidade:''},
html:(d,o)=>{const t=CATS.map(c=>[c[0],c[1]*(c[0]=='Mercearia'?d.s/0.92:1),c[2]]).sort((a,b)=>b[1]-a[1]),mx=t[0][1],td='padding:6px 8px;border-bottom:1px solid #f3f2f1',th='padding:6px 8px;border-bottom:1px solid #e1dfdd;font-weight:600';return `<table style='width:100%;border-collapse:collapse;font:13px Segoe UI,sans-serif;color:#252423'><tr style='color:#605e5c;text-align:left'><th style='${th}'>Categoria</th><th style='${th};text-align:right'>${hx(o.titulo)}</th><th style='${th};text-align:right'>Var.</th><th style='${th};width:30%'></th></tr>${t.map(c=>{const v=c[1]/c[2]-1;return `<tr><td style='${td}'>${c[0]}</td><td style='${td};text-align:right;white-space:nowrap'>${hv(c[1],o)}</td><td style='${td};text-align:right;color:${bomH(v,o)?COR.bom:COR.ruim}'>${v>=0?'+':''}${pc(v)}</td><td style='${td}'><div style='height:8px;border-radius:99px;background:#118dff;width:${(c[1]/mx*100).toFixed(0)}%'></div></td></tr>`}).join('')}</table>`},
dax:o=>`HTML Tabela =
VAR _td = "padding:6px 8px;border-bottom:1px solid #f3f2f1"
VAR _th = "padding:6px 8px;border-bottom:1px solid #e1dfdd;font-weight:600"
VAR _t =
    TOPN (
        6,
        ADDCOLUMNS ( VALUES ( 'Produto'[Categoria] ), "@v", [Vendas], "@aa", [Vendas AA] ),
        [@v], DESC
    )
VAR _max = MAXX ( _t, [@v] )
RETURN
"<table style='width:100%;border-collapse:collapse;font:13px Segoe UI,sans-serif;color:#252423'>" &
  "<tr style='color:#605e5c;text-align:left'>" &
    "<th style='" & _th & "'>Categoria</th>" &
    "<th style='" & _th & ";text-align:right'>${tx(o.titulo)}</th>" &
    "<th style='" & _th & ";text-align:right'>Var.</th>" &
    "<th style='" & _th & ";width:30%'></th></tr>" &
CONCATENATEX (
    _t,
    VAR _var = DIVIDE ( [@v] - [@aa], [@aa] )
    VAR _bom = ${bomD('_var',o)}
    RETURN
    "<tr><td style='" & _td & "'>" & 'Produto'[Categoria] & "</td>" &
    "<td style='" & _td & ";text-align:right;white-space:nowrap'>" & ${dv('[@v]',o)} & "</td>" &
    "<td style='" & _td & ";text-align:right;color:" & IF ( _bom, "${COR.bom}", "${COR.ruim}" ) & "'>" &
      IF ( _var >= 0, "+" ) & FORMAT ( _var, "0.0%" ) & "</td>" &
    "<td style='" & _td & "'><div style='height:8px;border-radius:99px;background:#118dff;width:" &
      FORMAT ( DIVIDE ( [@v], _max ) * 100, "0", "en-US" ) & "%'></div></td></tr>",
    "", [@v], DESC
) &
"</table>"`},

{id:'waffle',nome:'Waffle 10×10',cat:'Barras',desc:'Grade de 100 quadrados com CSS grid. Cada quadrado vale 1%.',req:'<code>[Concluídos]</code>, <code>[Total]</code>',
opts:['titulo'],def:{titulo:'das tarefas concluídas'},
html:(d,o)=>{const p=Math.min(d.s,1)*.86,n=Math.round(p*100);let c='';for(let i=1;i<=100;i++)c+=`<div style='aspect-ratio:1;border-radius:2px;background:${i<=n?'#e66c37':'#edebe9'}'></div>`;return `<div style='display:flex;gap:16px;align-items:center;font-family:Segoe UI,sans-serif'><div style='display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:150px;flex:none'>${c}</div><div><div style='font-size:28px;font-weight:600;color:#252423'>${pc(p,0)}</div><div style='font-size:13px;color:#605e5c;max-width:110px'>${hx(o.titulo)}</div></div></div>`},
dax:o=>`HTML Waffle =
VAR _pct = MIN ( DIVIDE ( [Concluídos], [Total] ), 1 )
VAR _cheios = ROUND ( _pct * 100, 0 )
RETURN
"<div style='display:flex;gap:16px;align-items:center;font-family:Segoe UI,sans-serif'>" &
  "<div style='display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:150px;flex:none'>" &
  CONCATENATEX (
      GENERATESERIES ( 1, 100 ),
      "<div style='aspect-ratio:1;border-radius:2px;background:" & IF ( [Value] <= _cheios, "#e66c37", "#edebe9" ) & "'></div>",
      "", [Value], ASC
  ) &
  "</div>" &
  "<div><div style='font-size:28px;font-weight:600;color:#252423'>" & FORMAT ( _pct, "0%" ) & "</div>" &
  "<div style='font-size:13px;color:#605e5c;max-width:110px'>${tx(o.titulo)}</div></div>" &
"</div>"`}
];

// Compatibilidade: completa as opções que faltarem e mantém t.dax como texto (versão padrão).
// Assim, uma página antiga guardada em cache no navegador continua funcionando com este arquivo.
T.forEach(t=>{
  const html=t.html,dax=t.dax,comp=o=>({...OPT_DEF,...(t.def||{}),...(o||{})});
  t.html=(d,o)=>html(d,comp(o));
  if(typeof dax=='function'){t.daxFn=o=>dax(comp(o));t.dax=t.daxFn()}
});
