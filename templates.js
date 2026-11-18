// Galeria HTML Content Secure: templates
// Para incluir um template novo, acrescente um objeto ao fim do array T.
// Campos: id (único), nome, cat (KPIs | Barras | SVG | Listas | Status),
// desc, req (medidas/colunas a trocar), html(d) para a prévia e dax (a medida).
// d traz dados de exemplo: { s, meta, vendas, aa, varp }.

const n0=v=>Math.round(v).toLocaleString('pt-BR');
const pc=(v,d=1)=>(v*100).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})+'%';
const f=v=>(+v).toFixed(2);
const MES=[0.78,0.84,0.8,0.9,0.86,0.95,0.91,0.98,0.94,1.02,0.97];
const CATS=[['Bebidas',412000,380000],['Mercearia',356000,371000],['Limpeza',248000,229000],['Hortifrúti',187000,176000],['Padaria',121000,133000],['Frios',98000,90000]];
const card="font-family:Segoe UI,sans-serif;padding:16px 20px;border-radius:12px;background:#ffffff;border:1px solid #e6e6e6";

const T=[
{id:'kpi',nome:'KPI com variação',cat:'KPIs',desc:'Valor principal com seta e % contra o ano anterior.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code>',
html:d=>{const up=d.varp>=0,c=up?'#0f9d58':'#d93025';return `<div style='${card};min-width:220px'><div style='font-size:13px;color:#605e5c'>Vendas</div><div style='font-size:34px;font-weight:600;color:#252423;line-height:1.1'>R$ ${n0(d.vendas)}</div><div style='font-size:13px;margin-top:6px;color:${c}'>${up?'▲':'▼'} ${pc(Math.abs(d.varp))} <span style='color:#605e5c'>vs ano anterior</span></div></div>`},
dax:`HTML KPI Variação =
VAR _atual = [Vendas]
VAR _anterior = [Vendas AA]
VAR _var = DIVIDE ( _atual - _anterior, _anterior )
VAR _cor = IF ( _var >= 0, "#0f9d58", "#d93025" )
VAR _seta = IF ( _var >= 0, "▲", "▼" )
RETURN
"<div style='font-family:Segoe UI,sans-serif;padding:16px 20px;border-radius:12px;background:#ffffff;border:1px solid #e6e6e6'>" &
  "<div style='font-size:13px;color:#605e5c'>Vendas</div>" &
  "<div style='font-size:34px;font-weight:600;color:#252423;line-height:1.1'>R$ " & FORMAT ( _atual, "#,0" ) & "</div>" &
  "<div style='font-size:13px;margin-top:6px;color:" & _cor & "'>" & _seta & " " & FORMAT ( ABS ( _var ), "0.0%" ) &
  " <span style='color:#605e5c'>vs ano anterior</span></div>" &
"</div>"`},

{id:'meta',nome:'KPI com meta e progresso',cat:'Barras',desc:'Barra que muda de cor por faixa: verde, âmbar, vermelho.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
html:d=>{const p=d.s,c=p>=1?'#0f9d58':p>=.8?'#f9ab00':'#d93025';return `<div style='${card};min-width:240px'><div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c'><span>Vendas vs meta</span><b style='color:${c}'>${pc(p,0)}</b></div><div style='font-size:28px;font-weight:600;color:#252423;margin:4px 0 10px'>R$ ${n0(d.vendas)}</div><div style='height:10px;background:#edebe9;border-radius:99px;overflow:hidden'><div style='height:100%;width:${(Math.min(p,1)*100).toFixed(1)}%;background:${c};border-radius:99px'></div></div><div style='font-size:12px;color:#605e5c;margin-top:6px'>Meta: R$ ${n0(d.meta)}</div></div>`},
dax:`HTML KPI Meta =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _pct = DIVIDE ( _real, _meta )
VAR _larg = MIN ( _pct, 1 ) * 100
VAR _cor = SWITCH ( TRUE (), _pct >= 1, "#0f9d58", _pct >= 0.8, "#f9ab00", "#d93025" )
RETURN
"<div style='font-family:Segoe UI,sans-serif;padding:16px 20px;border-radius:12px;background:#ffffff;border:1px solid #e6e6e6'>" &
  "<div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c'>" &
    "<span>Vendas vs meta</span><b style='color:" & _cor & "'>" & FORMAT ( _pct, "0%" ) & "</b></div>" &
  "<div style='font-size:28px;font-weight:600;color:#252423;margin:4px 0 10px'>R$ " & FORMAT ( _real, "#,0" ) & "</div>" &
  "<div style='height:10px;background:#edebe9;border-radius:99px;overflow:hidden'>" &
    "<div style='height:100%;width:" & FORMAT ( _larg, "0.0", "en-US" ) & "%;background:" & _cor & ";border-radius:99px'></div></div>" &
  "<div style='font-size:12px;color:#605e5c;margin-top:6px'>Meta: R$ " & FORMAT ( _meta, "#,0" ) & "</div>" &
"</div>"`},

{id:'gauge',nome:'Gauge semicircular',cat:'SVG',desc:'Arco SVG preenchido pelo % da meta, sem visual extra.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
html:d=>{const p=Math.min(d.s,1);return `<svg viewBox='0 0 120 80' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'><path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#edebe9' stroke-width='12' stroke-linecap='round'/><path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#118dff' stroke-width='12' stroke-linecap='round' stroke-dasharray='${f(p*157.08)} 200'/><text x='60' y='56' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>${pc(p,0)}</text><text x='60' y='77' text-anchor='middle' font-size='7' fill='#605e5c'>da meta</text></svg>`},
dax:`HTML Gauge =
VAR _pct = MIN ( DIVIDE ( [Vendas], [Meta] ), 1 )
VAR _preench = _pct * 157.08   -- comprimento do arco (pi * raio 50)
RETURN
"<svg viewBox='0 0 120 80' width='100%' style='max-width:240px;font-family:Segoe UI,sans-serif'>" &
  "<path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#edebe9' stroke-width='12' stroke-linecap='round'/>" &
  "<path d='M10 62 A50 50 0 0 1 110 62' fill='none' stroke='#118dff' stroke-width='12' stroke-linecap='round' " &
    "stroke-dasharray='" & FORMAT ( _preench, "0.00", "en-US" ) & " 200'/>" &
  "<text x='60' y='56' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>" & FORMAT ( _pct, "0%" ) & "</text>" &
  "<text x='60' y='77' text-anchor='middle' font-size='7' fill='#605e5c'>da meta</text>" &
"</svg>"`},

{id:'donut',nome:'Donut de percentual',cat:'SVG',desc:'Anel com o % no centro. Bom para concluído/total.',req:'<code>[Concluídos]</code>, <code>[Total]</code>',
html:d=>{const p=Math.min(d.s,1)*.86,c=251.33;return `<svg viewBox='0 0 100 100' width='100%' style='max-width:150px;font-family:Segoe UI,sans-serif'><circle cx='50' cy='50' r='40' fill='none' stroke='#edebe9' stroke-width='10'/><circle cx='50' cy='50' r='40' fill='none' stroke='#6b007b' stroke-width='10' stroke-linecap='round' stroke-dasharray='${f(p*c)} ${f(c)}' transform='rotate(-90 50 50)'/><text x='50' y='52' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>${pc(p,0)}</text><text x='50' y='64' text-anchor='middle' font-size='7' fill='#605e5c'>concluído</text></svg>`},
dax:`HTML Donut =
VAR _pct = MIN ( DIVIDE ( [Concluídos], [Total] ), 1 )
VAR _circ = 251.33   -- circunferência (2 * pi * raio 40)
RETURN
"<svg viewBox='0 0 100 100' width='100%' style='max-width:150px;font-family:Segoe UI,sans-serif'>" &
  "<circle cx='50' cy='50' r='40' fill='none' stroke='#edebe9' stroke-width='10'/>" &
  "<circle cx='50' cy='50' r='40' fill='none' stroke='#6b007b' stroke-width='10' stroke-linecap='round' " &
    "stroke-dasharray='" & FORMAT ( _pct * _circ, "0.00", "en-US" ) & " " & FORMAT ( _circ, "0.00", "en-US" ) & "' " &
    "transform='rotate(-90 50 50)'/>" &
  "<text x='50' y='52' text-anchor='middle' font-size='18' font-weight='600' fill='#252423'>" & FORMAT ( _pct, "0%" ) & "</text>" &
  "<text x='50' y='64' text-anchor='middle' font-size='7' fill='#605e5c'>concluído</text>" &
"</svg>"`},

{id:'spark',nome:'Card com sparkline',cat:'SVG',desc:'Valor do período com linha dos últimos meses desenhada em SVG.',req:'<code>[Vendas]</code> e a coluna <code>\'Calendario\'[AnoMes]</code> (inteiro, ex.: 202611). Filtre a página ou o visual para o período desejado, como os últimos 12 meses.',
html:d=>{const v=[...MES.map(x=>x*1e6),d.vendas],mn=Math.min(...v),mx=Math.max(...v),r=mx-mn||1,n=v.length;const pts=v.map((y,i)=>f(i/(n-1)*196+2)+','+f(48-(y-mn)/r*44)).join(' ');const ly=48-(v[n-1]-mn)/r*44;return `<div style='${card};min-width:240px'><div style='font-size:13px;color:#605e5c'>Vendas no mês</div><div style='font-size:28px;font-weight:600;color:#252423;margin-bottom:8px'>R$ ${n0(d.vendas)}</div><svg viewBox='0 0 200 50' width='100%' height='50'><polyline points='${pts}' fill='none' stroke='#118dff' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/><circle cx='198' cy='${f(ly)}' r='3' fill='#118dff'/></svg></div>`},
dax:`HTML Sparkline =
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
"<div style='font-family:Segoe UI,sans-serif;padding:16px 20px;border-radius:12px;background:#ffffff;border:1px solid #e6e6e6'>" &
  "<div style='font-size:13px;color:#605e5c'>Vendas no mês</div>" &
  "<div style='font-size:28px;font-weight:600;color:#252423;margin-bottom:8px'>R$ " & FORMAT ( _ultimo, "#,0" ) & "</div>" &
  "<svg viewBox='0 0 200 50' width='100%' height='50'>" &
    "<polyline points='" & _linha & "' fill='none' stroke='#118dff' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/>" &
    "<circle cx='198' cy='" & FORMAT ( _yUlt, "0.0", "en-US" ) & "' r='3' fill='#118dff'/>" &
  "</svg>" &
"</div>"`},

{id:'rank',nome:'Ranking com barras',cat:'Listas',desc:'Top 5 categorias com barras proporcionais ao maior valor.',req:'<code>[Vendas]</code> e a coluna <code>\'Produto\'[Categoria]</code>',
html:d=>{const t=CATS.slice(0,5).map(c=>[c[0],c[1]*(c[0]=='Bebidas'?d.s/0.92:1)]).sort((a,b)=>b[1]-a[1]),mx=t[0][1];return `<div style='font-family:Segoe UI,sans-serif;font-size:13px;color:#252423;width:100%;max-width:300px'>${t.map(c=>`<div style='margin:0 0 10px'><div style='display:flex;justify-content:space-between;margin-bottom:4px'><span>${c[0]}</span><b>${n0(c[1])}</b></div><div style='height:8px;background:#edebe9;border-radius:99px'><div style='height:8px;border-radius:99px;background:#118dff;width:${(c[1]/mx*100).toFixed(1)}%'></div></div></div>`).join('')}</div>`},
dax:`HTML Ranking =
VAR _top =
    TOPN ( 5, ADDCOLUMNS ( VALUES ( 'Produto'[Categoria] ), "@v", [Vendas] ), [@v], DESC )
VAR _max = MAXX ( _top, [@v] )
RETURN
"<div style='font-family:Segoe UI,sans-serif;font-size:13px;color:#252423'>" &
CONCATENATEX (
    _top,
    "<div style='margin:0 0 10px'>" &
      "<div style='display:flex;justify-content:space-between;margin-bottom:4px'>" &
        "<span>" & 'Produto'[Categoria] & "</span><b>" & FORMAT ( [@v], "#,0" ) & "</b></div>" &
      "<div style='height:8px;background:#edebe9;border-radius:99px'>" &
        "<div style='height:8px;border-radius:99px;background:#118dff;width:" &
        FORMAT ( DIVIDE ( [@v], _max ) * 100, "0.0", "en-US" ) & "%'></div></div>" &
    "</div>",
    "", [@v], DESC
) &
"</div>"`},

{id:'status',nome:'Status com pulso',cat:'Status',desc:'Pílula de semáforo com ponto pulsando via @keyframes.',req:'<code>[Vendas]</code>, <code>[Meta]</code>',
html:d=>{const p=d.s,st=p>=1?'No alvo':p>=.8?'Atenção':'Crítico',c=p>=1?'#0f9d58':p>=.8?'#e37400':'#d93025',bg=p>=1?'#e6f4ea':p>=.8?'#fef3e0':'#fce8e6';return `<style>@keyframes pulso{0%{box-shadow:0 0 0 0 ${c}88}70%{box-shadow:0 0 0 8px ${c}00}100%{box-shadow:0 0 0 0 ${c}00}}</style><span style='display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;background:${bg};color:${c};font:600 13px Segoe UI,sans-serif'><span style='width:8px;height:8px;border-radius:50%;background:${c};animation:pulso 1.8s infinite'></span>${st}</span>`},
dax:`HTML Status =
VAR _pct = DIVIDE ( [Vendas], [Meta] )
VAR _txt = SWITCH ( TRUE (), _pct >= 1, "No alvo", _pct >= 0.8, "Atenção", "Crítico" )
VAR _cor = SWITCH ( TRUE (), _pct >= 1, "#0f9d58", _pct >= 0.8, "#e37400", "#d93025" )
VAR _fundo = SWITCH ( TRUE (), _pct >= 1, "#e6f4ea", _pct >= 0.8, "#fef3e0", "#fce8e6" )
RETURN
"<style>@keyframes pulso{" &
  "0%{box-shadow:0 0 0 0 " & _cor & "88}" &
  "70%{box-shadow:0 0 0 8px " & _cor & "00}" &
  "100%{box-shadow:0 0 0 0 " & _cor & "00}}</style>" &
"<span style='display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;" &
  "background:" & _fundo & ";color:" & _cor & ";font:600 13px Segoe UI,sans-serif'>" &
  "<span style='width:8px;height:8px;border-radius:50%;background:" & _cor & ";animation:pulso 1.8s infinite'></span>" &
  _txt &
"</span>"`},

{id:'bullet',nome:'Bullet chart',cat:'SVG',desc:'Realizado sobre faixas de desempenho, com a meta marcada.',req:'<code>[Vendas]</code>, <code>[Meta]</code>. As faixas ficam em 60% e 90% da meta.',
html:d=>{const e=Math.max(d.vendas,d.meta)*1.2,x=v=>f(v/e*240);return `<div style='font-family:Segoe UI,sans-serif;width:100%;max-width:320px'><div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c;margin-bottom:4px'><span>Vendas</span><span><b style='color:#252423'>${pc(d.s,0)}</b> da meta</span></div><svg viewBox='0 0 240 40' width='100%'><rect x='0' y='8' width='240' height='24' fill='#e1dfdd'/><rect x='0' y='8' width='${x(d.meta*.9)}' height='24' fill='#c8c6c4'/><rect x='0' y='8' width='${x(d.meta*.6)}' height='24' fill='#a19f9d'/><rect x='0' y='15' width='${x(d.vendas)}' height='10' fill='#252423'/><rect x='${f(d.meta/e*240-1.25)}' y='4' width='2.5' height='32' fill='#d93025'/></svg></div>`},
dax:`HTML Bullet =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _escala = MAX ( _real, _meta ) * 1.2
VAR _wReal = DIVIDE ( _real, _escala ) * 240
VAR _xMeta = DIVIDE ( _meta, _escala ) * 240 - 1.25
VAR _f1 = DIVIDE ( _meta * 0.6, _escala ) * 240
VAR _f2 = DIVIDE ( _meta * 0.9, _escala ) * 240
RETURN
"<div style='font-family:Segoe UI,sans-serif'>" &
  "<div style='display:flex;justify-content:space-between;font-size:13px;color:#605e5c;margin-bottom:4px'>" &
    "<span>Vendas</span><span><b style='color:#252423'>" & FORMAT ( DIVIDE ( _real, _meta ), "0%" ) & "</b> da meta</span></div>" &
  "<svg viewBox='0 0 240 40' width='100%'>" &
    "<rect x='0' y='8' width='240' height='24' fill='#e1dfdd'/>" &
    "<rect x='0' y='8' width='" & FORMAT ( _f2, "0.00", "en-US" ) & "' height='24' fill='#c8c6c4'/>" &
    "<rect x='0' y='8' width='" & FORMAT ( _f1, "0.00", "en-US" ) & "' height='24' fill='#a19f9d'/>" &
    "<rect x='0' y='15' width='" & FORMAT ( _wReal, "0.00", "en-US" ) & "' height='10' fill='#252423'/>" &
    "<rect x='" & FORMAT ( _xMeta, "0.00", "en-US" ) & "' y='4' width='2.5' height='32' fill='#d93025'/>" &
  "</svg>" &
"</div>"`},

{id:'alerta',nome:'Alerta com texto dinâmico',cat:'Status',desc:'Mensagem que muda de tom e de texto conforme o resultado.',req:'<code>[Vendas]</code>, <code>[Vendas AA]</code>',
html:d=>{const ok=d.varp>=0,c=ok?'#0f9d58':'#d93025',bg=ok?'#e6f4ea':'#fce8e6',msg=ok?`Vendas ${pc(d.varp)} acima do ano anterior.`:`Vendas ${pc(Math.abs(d.varp))} abaixo do ano anterior. Revise as categorias em queda.`;return `<div style='display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:10px;background:${bg};border-left:4px solid ${c};font:14px/1.45 Segoe UI,sans-serif;color:#252423;max-width:340px'><svg width='20' height='20' viewBox='0 0 20 20' style='flex:none'><circle cx='10' cy='10' r='9' fill='${c}'/><text x='10' y='14.5' text-anchor='middle' font-size='13' font-weight='700' fill='#fff'>${ok?'✓':'!'}</text></svg><div><b>${ok?'Bom desempenho':'Atenção'}</b><br>${msg}</div></div>`},
dax:`HTML Alerta =
VAR _var = DIVIDE ( [Vendas] - [Vendas AA], [Vendas AA] )
VAR _ok = _var >= 0
VAR _cor = IF ( _ok, "#0f9d58", "#d93025" )
VAR _fundo = IF ( _ok, "#e6f4ea", "#fce8e6" )
VAR _msg =
    IF (
        _ok,
        "Vendas " & FORMAT ( _var, "0.0%" ) & " acima do ano anterior.",
        "Vendas " & FORMAT ( ABS ( _var ), "0.0%" ) & " abaixo do ano anterior. Revise as categorias em queda."
    )
RETURN
"<div style='display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:10px;" &
  "background:" & _fundo & ";border-left:4px solid " & _cor & ";font:14px/1.45 Segoe UI,sans-serif;color:#252423'>" &
  "<svg width='20' height='20' viewBox='0 0 20 20' style='flex:none'>" &
    "<circle cx='10' cy='10' r='9' fill='" & _cor & "'/>" &
    "<text x='10' y='14.5' text-anchor='middle' font-size='13' font-weight='700' fill='#fff'>" & IF ( _ok, "✓", "!" ) & "</text></svg>" &
  "<div><b>" & IF ( _ok, "Bom desempenho", "Atenção" ) & "</b><br>" & _msg & "</div>" &
"</div>"`},

{id:'etapas',nome:'Linha de etapas',cat:'Status',desc:'Stepper de processo: pedido, aprovação, separação, transporte, entrega.',req:'<code>[Etapa Atual]</code>, um número de 1 a 5. Os nomes das etapas ficam no DATATABLE.',
html:d=>{const e=Math.max(1,Math.min(5,Math.round((d.s-.4)/.9*4)+1)),N=['Pedido','Aprovação','Separação','Transporte','Entregue'];return `<div style='display:flex;font:12px Segoe UI,sans-serif;color:#605e5c;width:100%;max-width:340px'>${N.map((nm,i)=>{const n=i+1,ok=n<=e;return `<div style='flex:1;text-align:center;position:relative'>${n>1?`<div style='position:absolute;top:13px;right:50%;width:100%;height:3px;background:${ok?'#118dff':'#e1dfdd'}'></div>`:''}<div style='position:relative;z-index:1;box-sizing:border-box;width:28px;height:28px;margin:0 auto 6px;border-radius:50%;background:${ok?'#118dff':'#ffffff'};border:2px solid ${ok?'#118dff':'#c8c6c4'};color:${ok?'#ffffff':'#a19f9d'};font-weight:600;line-height:24px'>${n}</div><div style='${n==e?'color:#252423;font-weight:600':''}'>${nm}</div></div>`}).join('')}</div>`},
dax:`HTML Etapas =
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
html:d=>{const t=CATS.map(c=>[c[0],c[1]*(c[0]=='Mercearia'?d.s/0.92:1),c[2]]).sort((a,b)=>b[1]-a[1]),mx=t[0][1],td='padding:6px 8px;border-bottom:1px solid #f3f2f1',th='padding:6px 8px;border-bottom:1px solid #e1dfdd;font-weight:600';return `<table style='width:100%;border-collapse:collapse;font:13px Segoe UI,sans-serif;color:#252423'><tr style='color:#605e5c;text-align:left'><th style='${th}'>Categoria</th><th style='${th};text-align:right'>Vendas</th><th style='${th};text-align:right'>Var.</th><th style='${th};width:30%'></th></tr>${t.map(c=>{const v=c[1]/c[2]-1;return `<tr><td style='${td}'>${c[0]}</td><td style='${td};text-align:right'>${n0(c[1])}</td><td style='${td};text-align:right;color:${v>=0?'#0f9d58':'#d93025'}'>${v>=0?'+':''}${pc(v)}</td><td style='${td}'><div style='height:8px;border-radius:99px;background:#118dff;width:${(c[1]/mx*100).toFixed(0)}%'></div></td></tr>`}).join('')}</table>`},
dax:`HTML Tabela =
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
    "<th style='" & _th & ";text-align:right'>Vendas</th>" &
    "<th style='" & _th & ";text-align:right'>Var.</th>" &
    "<th style='" & _th & ";width:30%'></th></tr>" &
CONCATENATEX (
    _t,
    VAR _var = DIVIDE ( [@v] - [@aa], [@aa] )
    RETURN
    "<tr><td style='" & _td & "'>" & 'Produto'[Categoria] & "</td>" &
    "<td style='" & _td & ";text-align:right'>" & FORMAT ( [@v], "#,0" ) & "</td>" &
    "<td style='" & _td & ";text-align:right;color:" & IF ( _var >= 0, "#0f9d58", "#d93025" ) & "'>" &
      IF ( _var >= 0, "+" ) & FORMAT ( _var, "0.0%" ) & "</td>" &
    "<td style='" & _td & "'><div style='height:8px;border-radius:99px;background:#118dff;width:" &
      FORMAT ( DIVIDE ( [@v], _max ) * 100, "0", "en-US" ) & "%'></div></td></tr>",
    "", [@v], DESC
) &
"</table>"`},

{id:'waffle',nome:'Waffle 10×10',cat:'Barras',desc:'Grade de 100 quadrados com CSS grid. Cada quadrado vale 1%.',req:'<code>[Concluídos]</code>, <code>[Total]</code>',
html:d=>{const p=Math.min(d.s,1)*.86,n=Math.round(p*100);let c='';for(let i=1;i<=100;i++)c+=`<div style='aspect-ratio:1;border-radius:2px;background:${i<=n?'#e66c37':'#edebe9'}'></div>`;return `<div style='display:flex;gap:16px;align-items:center;font-family:Segoe UI,sans-serif'><div style='display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:150px'>${c}</div><div><div style='font-size:28px;font-weight:600;color:#252423'>${pc(p,0)}</div><div style='font-size:13px;color:#605e5c'>das tarefas<br>concluídas</div></div></div>`},
dax:`HTML Waffle =
VAR _pct = MIN ( DIVIDE ( [Concluídos], [Total] ), 1 )
VAR _cheios = ROUND ( _pct * 100, 0 )
RETURN
"<div style='display:flex;gap:16px;align-items:center;font-family:Segoe UI,sans-serif'>" &
  "<div style='display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:150px'>" &
  CONCATENATEX (
      GENERATESERIES ( 1, 100 ),
      "<div style='aspect-ratio:1;border-radius:2px;background:" & IF ( [Value] <= _cheios, "#e66c37", "#edebe9" ) & "'></div>",
      "", [Value], ASC
  ) &
  "</div>" &
  "<div><div style='font-size:28px;font-weight:600;color:#252423'>" & FORMAT ( _pct, "0%" ) & "</div>" &
  "<div style='font-size:13px;color:#605e5c'>das tarefas<br>concluídas</div></div>" &
"</div>"`}
];
