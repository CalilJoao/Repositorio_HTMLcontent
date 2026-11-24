// Galeria HTML Content Secure: templates
// Para incluir um template novo, acrescente um objeto ao fim do array T.
// Campos:
//   id (único), nome, cat (KPIs | Barras | SVG | Listas | Status | Tempo), desc, req (o que trocar no modelo)
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

// Faixas coloridas do medidor de ponteiro (0 a 150% da meta), já respeitando sentido e limites
function ponteiroFaixas(o){
  const l1=o.lim1/100,l2=o.lim2/100,M=1.5,cl=v=>Math.min(Math.max(v,0),M);
  const B=o.inv?[[0,1/l2,COR.bom],[1/l2,1/l1,COR.aten],[1/l1,M,COR.ruim]]:[[0,l1,COR.ruim],[l1,l2,COR.aten],[l2,M,COR.bom]];
  const P=v=>{const a=Math.PI*(1-cl(v)/M);return f(60+50*Math.cos(a))+' '+f(62-50*Math.sin(a))};
  return B.filter(b=>cl(b[1])>cl(b[0])).map(b=>`<path d='M${P(b[0])} A50 50 0 0 1 ${P(b[1])}' fill='none' stroke='${b[2]}' stroke-width='12'/>`).join('');
}

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
"</div>"`},

{id:'funil',nome:'Funil de etapas',cat:'Listas',desc:'Etapas em sequência com o volume de cada uma e a % de conversão entre elas.',req:'<code>[Etapa 1]</code> a <code>[Etapa 4]</code>. Os nomes das etapas ficam no UNION.',
opts:['titulo','unidade','abrev'],def:{titulo:'Funil de vendas',unidade:''},
html:(d,o)=>{const E=[['Leads',4800],['Oportunidades',1900],['Propostas',760],['Fechados',Math.round(310*d.s/.92)]],mx=E[0][1],C=['#118dff','#0e7ae0','#0b66bf','#08529e'];return `<div style='font-family:Segoe UI,sans-serif;color:#252423;width:100%;max-width:340px'>${o.titulo?`<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${hx(o.titulo)}</div>`:''}${E.map((e,i)=>`${i?`<div style='padding-left:106px;text-align:center;font-size:11px;color:#605e5c;margin:0 0 4px'>↓ ${pc(e[1]/E[i-1][1])}</div>`:''}<div style='display:flex;align-items:center;gap:10px;margin-bottom:4px'><span style='width:96px;flex:none;font-size:12px;color:#605e5c;text-align:right'>${e[0]}</span><div style='flex:1;display:flex;justify-content:center'><div style='width:${Math.max(e[1]/mx*100,18).toFixed(1)}%;background:${C[i]};color:#ffffff;border-radius:4px;padding:5px 0;text-align:center;font-size:12px;font-weight:600'>${hv(e[1],o)}</div></div></div>`).join('')}</div>`},
dax:o=>`HTML Funil =
VAR _etapas =
    UNION (
        ROW ( "n", 1, "nome", "Leads", "v", [Etapa 1] ),
        ROW ( "n", 2, "nome", "Oportunidades", "v", [Etapa 2] ),
        ROW ( "n", 3, "nome", "Propostas", "v", [Etapa 3] ),
        ROW ( "n", 4, "nome", "Fechados", "v", [Etapa 4] )
    )
VAR _max = MAXX ( _etapas, [v] )
RETURN
"<div style='font-family:Segoe UI,sans-serif;color:#252423'>" &${o.titulo?`
  "<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${tx(o.titulo)}</div>" &`:''}
CONCATENATEX (
    _etapas,
    VAR _n = [n]
    VAR _ant = MAXX ( FILTER ( _etapas, [n] = _n - 1 ), [v] )
    VAR _larg = MAX ( DIVIDE ( [v], _max ) * 100, 18 )
    VAR _cor = SWITCH ( _n, 1, "#118dff", 2, "#0e7ae0", 3, "#0b66bf", "#08529e" )
    RETURN
    IF ( _n > 1,
      "<div style='padding-left:106px;text-align:center;font-size:11px;color:#605e5c;margin:0 0 4px'>↓ " &
      FORMAT ( DIVIDE ( [v], _ant ), "0.0%" ) & "</div>" ) &
    "<div style='display:flex;align-items:center;gap:10px;margin-bottom:4px'>" &
      "<span style='width:96px;flex:none;font-size:12px;color:#605e5c;text-align:right'>" & [nome] & "</span>" &
      "<div style='flex:1;display:flex;justify-content:center'>" &
        "<div style='width:" & FORMAT ( _larg, "0.0", "en-US" ) & "%;background:" & _cor &
        ";color:#ffffff;border-radius:4px;padding:5px 0;text-align:center;font-size:12px;font-weight:600'>" &
        ${dv('[v]',o)} & "</div></div></div>",
    "", [n], ASC
) &
"</div>"`},

{id:'multikpi',nome:'Card com 3 KPIs',cat:'KPIs',desc:'Três indicadores lado a lado, cada um com valor e variação contra o ano anterior.',req:'<code>[KPI 1]</code> a <code>[KPI 3]</code> e as versões <code>AA</code>. Nome, prefixo e sufixo de cada um ficam no UNION.',
opts:['abrev','sentido'],def:{},
html:(d,o)=>{const K=[['Receita',d.vendas,d.aa,'R$ ',''],['Volume',48200*d.s/.92,47100,'',' t'],['Pedidos',3420,3610,'','']];return `<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));overflow:hidden;font-family:Segoe UI,sans-serif;background:#ffffff;border:1px solid #e6e6e6;border-radius:12px;width:100%;max-width:520px'>${K.map(k=>{const v=k[1]/k[2]-1,c=bomH(v,o)?COR.bom:COR.ruim;return `<div style='padding:14px 16px;box-shadow:-1px -1px 0 #edebe9'><div style='font-size:12px;color:#605e5c'>${k[0]}</div><div style='font-size:22px;font-weight:600;color:#252423;white-space:nowrap'>${k[3]}${hv(k[1],{...o,unidade:''})}${k[4]}</div><div style='font-size:12px;color:${c}'>${v>=0?'▲':'▼'} ${pc(Math.abs(v))}</div></div>`}).join('')}</div>`},
dax:o=>`HTML Multi KPI =
VAR _kpis =
    UNION (
        ROW ( "n", 1, "nome", "Receita", "v", [KPI 1], "aa", [KPI 1 AA], "pre", "R$ ", "suf", "" ),
        ROW ( "n", 2, "nome", "Volume", "v", [KPI 2], "aa", [KPI 2 AA], "pre", "", "suf", " t" ),
        ROW ( "n", 3, "nome", "Pedidos", "v", [KPI 3], "aa", [KPI 3 AA], "pre", "", "suf", "" )
    )
RETURN
"<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));overflow:hidden;font-family:Segoe UI,sans-serif;background:#ffffff;border:1px solid #e6e6e6;border-radius:12px'>" &
CONCATENATEX (
    _kpis,
    VAR _var = DIVIDE ( [v] - [aa], [aa] )
    VAR _bom = ${bomD('_var',o)}
    RETURN
    "<div style='padding:14px 16px;box-shadow:-1px -1px 0 #edebe9'>" &
      "<div style='font-size:12px;color:#605e5c'>" & [nome] & "</div>" &
      "<div style='font-size:22px;font-weight:600;color:#252423;white-space:nowrap'>" & [pre] & ${dv('[v]',{...o,unidade:''})} & [suf] & "</div>" &
      "<div style='font-size:12px;color:" & IF ( _bom, "${COR.bom}", "${COR.ruim}" ) & "'>" &
        IF ( _var >= 0, "▲ ", "▼ " ) & FORMAT ( ABS ( _var ), "0.0%" ) & "</div>" &
    "</div>",
    "", [n], ASC
) &
"</div>"`},

{id:'calendario',nome:'Calendário de calor',cat:'Tempo',desc:'O mês em grade de dias, com a cor mais forte nos dias de maior valor.',req:'<code>[Vendas]</code> e a coluna <code>\'Calendario\'[Data]</code>. Filtre um mês.',
opts:['titulo'],def:{titulo:'Vendas por dia'},
html:(d,o)=>{const V=Array.from({length:30},(_,i)=>{const w=(i+0)%7;return (w==0||w==6?.35:.7)+.3*Math.abs(Math.sin(i*1.9))*Math.min(d.s,1.3)}),mx=Math.max(...V);let c='';for(const l of 'DSTQQSS')c+=`<div style='text-align:center;color:#605e5c'>${l}</div>`;V.forEach((v,i)=>{const a=.12+.88*v/mx;c+=`<div style='aspect-ratio:1;border-radius:3px;display:grid;place-items:center;background:rgba(17,141,255,${a.toFixed(2)});color:${a>.55?'#ffffff':'#252423'}'>${i+1}</div>`});return `<div style='font-family:Segoe UI,sans-serif;color:#252423;width:100%;max-width:280px'>${o.titulo?`<div style='font-weight:600;font-size:14px;margin-bottom:8px'>${hx(o.titulo)}</div>`:''}<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:10px'>${c}</div></div>`},
dax:o=>`HTML Calendario =
VAR _dias = ADDCOLUMNS ( VALUES ( 'Calendario'[Data] ), "@v", [Vendas] )
VAR _max = MAXX ( _dias, [@v] )
VAR _ini = MINX ( _dias, 'Calendario'[Data] )
VAR _vazios = WEEKDAY ( _ini, 1 ) - 1   -- semana começando no domingo
VAR _cab = "<div style='text-align:center;color:#605e5c'>"
RETURN
"<div style='font-family:Segoe UI,sans-serif;color:#252423'>" &${o.titulo?`
  "<div style='font-weight:600;font-size:14px;margin-bottom:8px'>${tx(o.titulo)}</div>" &`:''}
  "<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:10px'>" &
  _cab & "D</div>" & _cab & "S</div>" & _cab & "T</div>" & _cab & "Q</div>" & _cab & "Q</div>" & _cab & "S</div>" & _cab & "S</div>" &
  REPT ( "<div></div>", _vazios ) &
  CONCATENATEX (
      _dias,
      VAR _a = 0.12 + 0.88 * DIVIDE ( [@v], _max )
      RETURN
      "<div style='aspect-ratio:1;border-radius:3px;display:grid;place-items:center;background:rgba(17,141,255," &
      FORMAT ( _a, "0.00", "en-US" ) & ");color:" & IF ( _a > 0.55, "#ffffff", "#252423" ) & "'>" &
      DAY ( 'Calendario'[Data] ) & "</div>",
      "", 'Calendario'[Data], ASC
  ) &
  "</div>" &
"</div>"`},

{id:'empilhada',nome:'Barra 100% empilhada',cat:'Barras',desc:'A composição do total numa barra só, com legenda e a % de cada parte.',req:'<code>[Vendas]</code> e a coluna <code>\'Produto\'[Categoria]</code>',
opts:['titulo'],def:{titulo:'Participação por categoria'},
html:(d,o)=>{const P=['#118dff','#12239e','#e66c37','#6b007b','#e044a7','#744ec2'],t=CATS.map(c=>[c[0],c[1]*(c[0]=='Limpeza'?d.s/.92:1)]).sort((a,b)=>b[1]-a[1]),tot=t.reduce((a,c)=>a+c[1],0);return `<div style='font-family:Segoe UI,sans-serif;color:#252423;width:100%;max-width:360px'>${o.titulo?`<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${hx(o.titulo)}</div>`:''}<div style='display:flex;height:22px;border-radius:6px;overflow:hidden'>${t.map((c,i)=>`<div style='width:${(c[1]/tot*100).toFixed(2)}%;background:${P[i%6]}'></div>`).join('')}</div><div style='display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:12px'>${t.map((c,i)=>`<span style='display:inline-flex;align-items:center;gap:6px'><span style='width:10px;height:10px;border-radius:2px;background:${P[i%6]}'></span>${c[0]} <b>${pc(c[1]/tot,0)}</b></span>`).join('')}</div></div>`},
dax:o=>`HTML Barra Empilhada =
VAR _t = ADDCOLUMNS ( VALUES ( 'Produto'[Categoria] ), "@v", [Vendas] )
VAR _tot = SUMX ( _t, [@v] )
VAR _r = ADDCOLUMNS ( _t, "@i", RANKX ( _t, [@v], , DESC, DENSE ) )
VAR _c =
    ADDCOLUMNS (
        _r,
        "@cor", SWITCH ( MOD ( [@i] - 1, 6 ) + 1, 1, "#118dff", 2, "#12239e", 3, "#e66c37", 4, "#6b007b", 5, "#e044a7", "#744ec2" )
    )
RETURN
"<div style='font-family:Segoe UI,sans-serif;color:#252423'>" &${o.titulo?`
  "<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${tx(o.titulo)}</div>" &`:''}
  "<div style='display:flex;height:22px;border-radius:6px;overflow:hidden'>" &
  CONCATENATEX (
      _c,
      "<div style='width:" & FORMAT ( DIVIDE ( [@v], _tot ) * 100, "0.00", "en-US" ) & "%;background:" & [@cor] & "'></div>",
      "", [@v], DESC
  ) &
  "</div>" &
  "<div style='display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:12px'>" &
  CONCATENATEX (
      _c,
      "<span style='display:inline-flex;align-items:center;gap:6px'>" &
        "<span style='width:10px;height:10px;border-radius:2px;background:" & [@cor] & "'></span>" &
        'Produto'[Categoria] & " <b>" & FORMAT ( DIVIDE ( [@v], _tot ), "0%" ) & "</b></span>",
      "", [@v], DESC
  ) &
  "</div>" &
"</div>"`},

{id:'comparativo',nome:'Comparativo A vs B',cat:'Barras',desc:'Dois valores na mesma escala, com a diferença em destaque.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code> (ou realizado e planejado). Os rótulos ficam nas variáveis <code>_rotA</code> e <code>_rotB</code>.',
opts:['titulo','unidade','abrev','sentido'],def:{titulo:'Este ano vs ano anterior',unidade:'R$'},
html:(d,o)=>{const a=d.vendas,b=d.aa,mx=Math.max(a,b),df=a-b,v=df/b,c=bomH(v,o)?COR.bom:COR.ruim,row=(r,val,cor)=>`<div style='margin-top:10px'><div style='display:flex;justify-content:space-between;font-size:12px;color:#605e5c;margin-bottom:4px'><span>${r}</span><b style='color:#252423'>${hv(val,o)}</b></div><div style='height:12px;background:#f3f2f1;border-radius:4px'><div style='height:12px;border-radius:4px;background:${cor};width:${(val/mx*100).toFixed(1)}%'></div></div></div>`;return `<div style='${card};width:100%;max-width:340px'><div style='display:flex;justify-content:space-between;align-items:baseline;gap:10px'><span style='font-size:13px;color:#605e5c'>${hx(o.titulo)}</span><b style='font-size:13px;color:${c};white-space:nowrap'>${df>=0?'+':'−'}${hv(Math.abs(df),o)} (${df>=0?'+':'−'}${pc(Math.abs(v))})</b></div>${row('Este ano',a,'#118dff')}${row('Ano anterior',b,'#c8c6c4')}</div>`},
dax:o=>`HTML Comparativo =
VAR _a = [Vendas]
VAR _b = [Vendas AA]
VAR _rotA = "Este ano"
VAR _rotB = "Ano anterior"
VAR _max = MAX ( _a, _b )
VAR _dif = _a - _b
VAR _var = DIVIDE ( _dif, _b )
VAR _bom = ${bomD('_var',o)}
VAR _cor = IF ( _bom, "${COR.bom}", "${COR.ruim}" )
VAR _sinal = IF ( _dif >= 0, "+", "−" )
VAR _linha = "<div style='margin-top:10px'><div style='display:flex;justify-content:space-between;font-size:12px;color:#605e5c;margin-bottom:4px'><span>"
VAR _barra = "</b></div><div style='height:12px;background:#f3f2f1;border-radius:4px'><div style='height:12px;border-radius:4px;background:"
RETURN
"<div style='${card}'>" &
  "<div style='display:flex;justify-content:space-between;align-items:baseline;gap:10px'>" &
    "<span style='font-size:13px;color:#605e5c'>${tx(o.titulo)}</span>" &
    "<b style='font-size:13px;color:" & _cor & ";white-space:nowrap'>" & _sinal & ${dv('ABS ( _dif )',o)} &
    " (" & _sinal & FORMAT ( ABS ( _var ), "0.0%" ) & ")</b></div>" &
  _linha & _rotA & "</span><b style='color:#252423'>" & ${dv('_a',o)} & _barra &
    "#118dff;width:" & FORMAT ( DIVIDE ( _a, _max ) * 100, "0.0", "en-US" ) & "%'></div></div></div>" &
  _linha & _rotB & "</span><b style='color:#252423'>" & ${dv('_b',o)} & _barra &
    "#c8c6c4;width:" & FORMAT ( DIVIDE ( _b, _max ) * 100, "0.0", "en-US" ) & "%'></div></div></div>" &
"</div>"`},

{id:'marcos',nome:'Linha do tempo de marcos',cat:'Tempo',desc:'Marcos de um projeto com data e status: concluído, atrasado ou previsto.',req:'Tabela <code>\'Marcos\'</code> com as colunas <code>[Data]</code>, <code>[Marco]</code> e <code>[Status]</code> ("Concluído", "Atrasado" ou "Previsto").',
opts:['titulo'],def:{titulo:'Marcos do projeto'},
html:(d,o)=>{const M=[['15/01/2026','Kickoff','Concluído'],['10/03/2026','Projeto executivo','Concluído'],['05/06/2026','Compra de materiais',d.s>=1?'Concluído':'Atrasado'],['20/09/2026','Execução da obra','Previsto'],['30/11/2026','Entrega','Previsto']],C={'Concluído':'#0f9d58','Atrasado':'#d93025','Previsto':'#a19f9d'};return `<div style='font-family:Segoe UI,sans-serif;color:#252423;width:100%;max-width:300px'>${o.titulo?`<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${hx(o.titulo)}</div>`:''}${M.map((m,i)=>`<div style='display:flex;gap:12px'><div style='display:flex;flex-direction:column;align-items:center'><div style='width:12px;height:12px;border-radius:50%;background:${C[m[2]]};margin-top:4px;flex:none'></div>${i<M.length-1?`<div style='width:2px;flex:1;background:#e1dfdd'></div>`:''}</div><div style='padding-bottom:12px'><div style='font-size:12px;color:#605e5c'>${m[0]}</div><div style='font-size:14px;font-weight:600'>${m[1]}</div><div style='font-size:11px;font-weight:600;color:${C[m[2]]}'>${m[2]}</div></div></div>`).join('')}</div>`},
dax:o=>`HTML Marcos =
VAR _ultima = MAX ( 'Marcos'[Data] )
RETURN
"<div style='font-family:Segoe UI,sans-serif;color:#252423'>" &${o.titulo?`
  "<div style='font-weight:600;font-size:14px;margin-bottom:10px'>${tx(o.titulo)}</div>" &`:''}
CONCATENATEX (
    'Marcos',
    VAR _cor = SWITCH ( 'Marcos'[Status], "Concluído", "#0f9d58", "Atrasado", "#d93025", "#a19f9d" )
    RETURN
    "<div style='display:flex;gap:12px'>" &
      "<div style='display:flex;flex-direction:column;align-items:center'>" &
        "<div style='width:12px;height:12px;border-radius:50%;background:" & _cor & ";margin-top:4px;flex:none'></div>" &
        IF ( 'Marcos'[Data] < _ultima, "<div style='width:2px;flex:1;background:#e1dfdd'></div>" ) &
      "</div>" &
      "<div style='padding-bottom:12px'>" &
        "<div style='font-size:12px;color:#605e5c'>" & FORMAT ( 'Marcos'[Data], "dd/mm/yyyy" ) & "</div>" &
        "<div style='font-size:14px;font-weight:600'>" & 'Marcos'[Marco] & "</div>" &
        "<div style='font-size:11px;font-weight:600;color:" & _cor & "'>" & 'Marcos'[Status] & "</div>" &
      "</div>" &
    "</div>",
    "", 'Marcos'[Data], ASC
) &
"</div>"`},

{id:'scorecard',nome:'Scorecard em semáforo',cat:'Status',desc:'Lista de indicadores com real, meta e bolinha de status. Cada linha tem o seu sentido.',req:'<code>[Indicador 1]</code> a <code>[Indicador 4]</code> e as metas. Nome, formato, sufixo e sentido (<code>inv</code> = 1 quando menor é melhor) ficam no UNION.',
opts:['faixas'],def:{},
html:(d,o)=>{const I=[['Volume transportado',48200*d.s/.92,50000,'#,0',' t',0],['Disponibilidade de ativos',93.4,95,'0.0','%',0],['Custo de manutenção (R$ mil)',1150*d.s/.92,1250,'#,0','',1],['Acidentes',2,3,'#,0','',1]];const fm=(v,f)=>f=='0.0'?v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}):n0(v);const td='padding:7px 8px;border-bottom:1px solid #f3f2f1',th='padding:6px 8px;border-bottom:1px solid #e1dfdd;font-weight:600;color:#605e5c';return `<table style='width:100%;border-collapse:collapse;font:13px Segoe UI,sans-serif;color:#252423'><tr style='text-align:left'><th style='${th}'>Indicador</th><th style='${th};text-align:right'>Real</th><th style='${th};text-align:right'>Meta</th></tr>${I.map(r=>{const s=r[5]?(r[1]==0?999:r[2]/r[1]):r[1]/r[2],c=corH(s,o);return `<tr><td style='${td}'><span style='display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:8px'></span>${r[0]}</td><td style='${td};text-align:right;font-weight:600;white-space:nowrap'>${fm(r[1],r[3])}${r[4]}</td><td style='${td};text-align:right;color:#605e5c;white-space:nowrap'>${fm(r[2],r[3])}${r[4]}</td></tr>`}).join('')}</table>`},
dax:o=>`HTML Scorecard =
VAR _td = "padding:7px 8px;border-bottom:1px solid #f3f2f1"
VAR _th = "padding:6px 8px;border-bottom:1px solid #e1dfdd;font-weight:600;color:#605e5c"
VAR _ind =
    UNION (
        ROW ( "n", 1, "nome", "Volume transportado", "r", [Indicador 1], "m", [Meta 1], "fmt", "#,0", "suf", " t", "inv", 0 ),
        ROW ( "n", 2, "nome", "Disponibilidade de ativos", "r", [Indicador 2], "m", [Meta 2], "fmt", "0.0", "suf", "%", "inv", 0 ),
        ROW ( "n", 3, "nome", "Custo de manutenção (R$ mil)", "r", [Indicador 3], "m", [Meta 3], "fmt", "#,0", "suf", "", "inv", 1 ),
        ROW ( "n", 4, "nome", "Acidentes", "r", [Indicador 4], "m", [Meta 4], "fmt", "#,0", "suf", "", "inv", 1 )
    )
RETURN
"<table style='width:100%;border-collapse:collapse;font:13px Segoe UI,sans-serif;color:#252423'>" &
  "<tr style='text-align:left'><th style='" & _th & "'>Indicador</th>" &
  "<th style='" & _th & ";text-align:right'>Real</th><th style='" & _th & ";text-align:right'>Meta</th></tr>" &
CONCATENATEX (
    _ind,
    VAR _score = IF ( [inv] = 1, IF ( [r] = 0, 999, DIVIDE ( [m], [r] ) ), DIVIDE ( [r], [m] ) )
    VAR _cor = ${corD(o)}
    RETURN
    "<tr><td style='" & _td & "'><span style='display:inline-block;width:10px;height:10px;border-radius:50%;background:" & _cor &
      ";margin-right:8px'></span>" & [nome] & "</td>" &
    "<td style='" & _td & ";text-align:right;font-weight:600;white-space:nowrap'>" & FORMAT ( [r], [fmt] ) & [suf] & "</td>" &
    "<td style='" & _td & ";text-align:right;color:#605e5c;white-space:nowrap'>" & FORMAT ( [m], [fmt] ) & [suf] & "</td></tr>",
    "", [n], ASC
) &
"</table>"`},

{id:'ponteiro',nome:'Medidor de ponteiro',cat:'SVG',desc:'Velocímetro de 0 a 150% da meta, com faixas coloridas e agulha.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
opts:['titulo','sentido','faixas'],def:{titulo:'da meta'},
html:(d,o)=>{const p=d.s,a=Math.PI*(1-Math.min(Math.max(p,0),1.5)/1.5);return `<svg viewBox='0 0 120 92' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'>${ponteiroFaixas(o)}<line x1='60' y1='62' x2='${f(60+40*Math.cos(a))}' y2='${f(62-40*Math.sin(a))}' stroke='#252423' stroke-width='3' stroke-linecap='round'/><circle cx='60' cy='62' r='5' fill='#252423'/><text x='10' y='75' text-anchor='middle' font-size='6' fill='#605e5c'>0%</text><text x='110' y='75' text-anchor='middle' font-size='6' fill='#605e5c'>150%</text><text x='60' y='88' text-anchor='middle' font-size='11' font-weight='600' fill='#252423'>${pc(p,0)} <tspan font-weight='400' fill='#605e5c'>${hx(o.titulo)}</tspan></text></svg>`},
dax:o=>`HTML Ponteiro =
VAR _pct = DIVIDE ( [Vendas], [Meta] )
VAR _ang = PI () * ( 1 - MIN ( MAX ( _pct, 0 ), 1.5 ) / 1.5 )
VAR _x = 60 + 40 * COS ( _ang )
VAR _y = 62 - 40 * SIN ( _ang )
RETURN
"<svg viewBox='0 0 120 92' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'>" &
  "${ponteiroFaixas(o)}" &   -- faixas de cor calculadas para as opções escolhidas
  "<line x1='60' y1='62' x2='" & FORMAT ( _x, "0.00", "en-US" ) & "' y2='" & FORMAT ( _y, "0.00", "en-US" ) &
    "' stroke='#252423' stroke-width='3' stroke-linecap='round'/>" &
  "<circle cx='60' cy='62' r='5' fill='#252423'/>" &
  "<text x='10' y='75' text-anchor='middle' font-size='6' fill='#605e5c'>0%</text>" &
  "<text x='110' y='75' text-anchor='middle' font-size='6' fill='#605e5c'>150%</text>" &
  "<text x='60' y='88' text-anchor='middle' font-size='11' font-weight='600' fill='#252423'>" & FORMAT ( _pct, "0%" ) &
    " <tspan font-weight='400' fill='#605e5c'>${tx(o.titulo)}</tspan></text>" &
"</svg>"`},

{id:'aderencia',nome:'Aderência ao plano',cat:'KPIs',desc:'Executado sobre planejado em anel, com as contagens e o status por faixa.',req:'<code>[Executadas]</code>, <code>[Planejadas]</code>',
opts:['titulo','faixas'],def:{titulo:'Aderência ao plano de manutenção'},
html:(d,o)=>{const pl=200,ex=Math.round(pl*d.s),p=ex/pl,c=corH(p,o),k=p>=o.lim2/100?0:p>=o.lim1/100?1:2,st=['No alvo','Atenção','Crítico'][k],bg=['#e6f4ea','#fef3e0','#fce8e6'][k],tc=['#0f9d58','#e37400','#d93025'][k],C=213.63;return `<div style='${card};display:flex;align-items:center;gap:16px;width:100%;max-width:360px'><svg viewBox='0 0 80 80' width='80' height='80' style='flex:none'><circle cx='40' cy='40' r='34' fill='none' stroke='#edebe9' stroke-width='9'/><circle cx='40' cy='40' r='34' fill='none' stroke='${c}' stroke-width='9' stroke-linecap='round' stroke-dasharray='${f(Math.min(p,1)*C)} ${f(C)}' transform='rotate(-90 40 40)'/><text x='40' y='45' text-anchor='middle' font-size='16' font-weight='600' fill='#252423'>${pc(p,0)}</text></svg><div><div style='font-size:13px;color:#605e5c'>${hx(o.titulo)}</div><div style='font-size:15px;color:#252423;margin:4px 0 8px'><b style='font-size:20px'>${n0(ex)}</b> de ${n0(pl)} executadas</div><span style='display:inline-block;padding:3px 10px;border-radius:99px;background:${bg};color:${tc};font-size:12px;font-weight:600'>${st}</span></div></div>`},
dax:o=>{const a=lit(o.lim2),b=lit(o.lim1);return `HTML Aderencia =
VAR _exec = [Executadas]
VAR _plan = [Planejadas]
VAR _score = DIVIDE ( _exec, _plan )
VAR _cor = ${corD(o)}
VAR _txt = SWITCH ( TRUE (), _score >= ${a}, "No alvo", _score >= ${b}, "Atenção", "Crítico" )
VAR _fundo = SWITCH ( TRUE (), _score >= ${a}, "#e6f4ea", _score >= ${b}, "#fef3e0", "#fce8e6" )
VAR _corTxt = SWITCH ( TRUE (), _score >= ${a}, "#0f9d58", _score >= ${b}, "#e37400", "#d93025" )
VAR _circ = 213.63   -- circunferência (2 * pi * raio 34)
RETURN
"<div style='${card};display:flex;align-items:center;gap:16px'>" &
  "<svg viewBox='0 0 80 80' width='80' height='80' style='flex:none'>" &
    "<circle cx='40' cy='40' r='34' fill='none' stroke='#edebe9' stroke-width='9'/>" &
    "<circle cx='40' cy='40' r='34' fill='none' stroke='" & _cor & "' stroke-width='9' stroke-linecap='round' " &
      "stroke-dasharray='" & FORMAT ( MIN ( _score, 1 ) * _circ, "0.00", "en-US" ) & " " & FORMAT ( _circ, "0.00", "en-US" ) & "' " &
      "transform='rotate(-90 40 40)'/>" &
    "<text x='40' y='45' text-anchor='middle' font-size='16' font-weight='600' fill='#252423'>" & FORMAT ( _score, "0%" ) & "</text>" &
  "</svg>" &
  "<div>" &
    "<div style='font-size:13px;color:#605e5c'>${tx(o.titulo)}</div>" &
    "<div style='font-size:15px;color:#252423;margin:4px 0 8px'><b style='font-size:20px'>" & FORMAT ( _exec, "#,0" ) &
      "</b> de " & FORMAT ( _plan, "#,0" ) & " executadas</div>" &
    "<span style='display:inline-block;padding:3px 10px;border-radius:99px;background:" & _fundo & ";color:" & _corTxt &
      ";font-size:12px;font-weight:600'>" & _txt & "</span>" &
  "</div>" &
"</div>"`}},

{id:'diassem',nome:'Dias sem ocorrência',cat:'Tempo',desc:'Contador grande de dias desde a última ocorrência, comparado ao recorde.',req:'<code>[Data Última Ocorrência]</code> (uma data) e <code>[Recorde de Dias]</code>',
opts:['titulo'],def:{titulo:'dias sem acidente com afastamento'},
html:(d,o)=>{const dias=Math.round(87*d.s),rec=Math.max(142,dias);return `<div style='${card};width:100%;max-width:300px'><div style='display:flex;align-items:baseline;gap:10px'><span style='font-size:48px;font-weight:600;line-height:1;color:#0f9d58'>${n0(dias)}</span><span style='font-size:14px;color:#252423'>${hx(o.titulo)}</span></div><div style='height:6px;background:#edebe9;border-radius:99px;margin:12px 0 6px'><div style='height:6px;border-radius:99px;background:#0f9d58;width:${(dias/rec*100).toFixed(1)}%'></div></div><div style='font-size:12px;color:#605e5c'>Recorde: ${n0(rec)} dias</div></div>`},
dax:o=>`HTML Dias Sem Ocorrencia =
VAR _dias = DATEDIFF ( [Data Última Ocorrência], TODAY (), DAY )
VAR _rec = MAX ( [Recorde de Dias], _dias )
RETURN
"<div style='${card}'>" &
  "<div style='display:flex;align-items:baseline;gap:10px'>" &
    "<span style='font-size:48px;font-weight:600;line-height:1;color:#0f9d58'>" & FORMAT ( _dias, "#,0" ) & "</span>" &
    "<span style='font-size:14px;color:#252423'>${tx(o.titulo)}</span></div>" &
  "<div style='height:6px;background:#edebe9;border-radius:99px;margin:12px 0 6px'>" &
    "<div style='height:6px;border-radius:99px;background:#0f9d58;width:" & FORMAT ( DIVIDE ( _dias, _rec ) * 100, "0.0", "en-US" ) & "%'></div></div>" &
  "<div style='font-size:12px;color:#605e5c'>Recorde: " & FORMAT ( _rec, "#,0" ) & " dias</div>" &
"</div>"`}
];

// Compatibilidade: completa as opções que faltarem e mantém t.dax como texto (versão padrão).
// Assim, uma página antiga guardada em cache no navegador continua funcionando com este arquivo.
T.forEach(t=>{
  const html=t.html,dax=t.dax,comp=o=>({...OPT_DEF,...(t.def||{}),...(o||{})});
  t.html=(d,o)=>html(d,comp(o));
  if(typeof dax=='function'){t.daxFn=o=>dax(comp(o));t.dax=t.daxFn()}
});
