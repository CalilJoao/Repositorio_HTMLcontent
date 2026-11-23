# Como incluir um template

Cada template é um objeto no array `T` em `templates.js`. Para incluir um novo, acrescente um objeto ao fim do array:

```js
{
  id: 'meu-template',          // único, sem espaços
  nome: 'Nome que aparece no card',
  cat: 'KPIs',                 // KPIs | Barras | SVG | Listas | Status
  desc: 'Uma frase dizendo o que ele mostra.',
  req: '<code>[Vendas]</code>, <code>[Meta]</code>',   // o que trocar no modelo
  opts: ['titulo', 'unidade', 'abrev', 'sentido', 'faixas'],  // personalizações que ele aceita
  def: { titulo: 'Vendas', unidade: 'R$' },                   // valores padrão
  html: (d, o) => `<div style='...'>${hx(o.titulo)}: ${hv(d.vendas, o)}</div>`,  // prévia
  dax: o => `Minha Medida =
VAR _real = [Vendas]
VAR _meta = [Meta]
VAR _score = ${scoreD(o)}
VAR _cor = ${corD(o)}
RETURN
"<div style='color:" & _cor & "'>${tx(o.titulo)}: " & ${dv('_real', o)} & "</div>"`
}
```

## Dados de exemplo (`d`)

Mudam com o simulador da página: `s` (atingimento, 0,4 a 1,3), `meta`, `vendas`, `aa` (ano anterior) e `varp` (variação vs ano anterior).

## Opções (`o`)

| Opção | O que é | Aparece no painel se `opts` tiver |
|---|---|---|
| `titulo` | Título ou rótulo do visual | `'titulo'` |
| `unidade` | Ex.: `R$` (vai antes do número), `t`, `km` (vão depois) | `'unidade'` |
| `abrev` | `'nao'`, `'mil'`, `'mi'` ou `'auto'` | `'abrev'` |
| `inv` | `true` quando menor é melhor | `'sentido'` |
| `lim1`, `lim2` | % a partir do qual fica âmbar e verde | `'faixas'` |

## Helpers

| Prévia (JS) | DAX gerado | Para quê |
|---|---|---|
| `hx(texto)` | `tx(texto)` | Escapar texto (`tx` também dobra as aspas para a string DAX) |
| `hv(valor, o)` | `dv('_expr', o)` | Número com unidade e abreviação |
| `scoreH(real, meta, o)` + `corH(score, o)` | `scoreD(o)` + `corD(o)` | Cor verde/âmbar/vermelho respeitando sentido e faixas (o DAX espera `_real`, `_meta` e `_score`) |
| `bomH(variação, o)` | `bomD('_var', o)` | Se uma variação é boa ou ruim conforme o sentido |
| `n0`, `pc`, `f` |  | Número pt-BR, percentual pt-BR, 2 casas com ponto |
| `card`, `COR`, `MES`, `CATS` |  | Estilo base de card, cores de status e séries de exemplo |

## Checklist do PR

- [ ] Aumentei o número em `templates.js?v=` no `index.html` (evita que o navegador misture arquivo novo com antigo em cache)

- [ ] A medida não usa nada que o Secure bloqueia (cole o HTML no playground da página para conferir)
- [ ] Todo número que vai para CSS ou SVG usa `FORMAT(x, "...", "en-US")`
- [ ] Atributos HTML com aspas simples dentro das strings DAX
- [ ] A prévia (`html`) gera o mesmo HTML que a medida (`dax`), com todas as opções do `opts`
- [ ] Testado num relatório Power BI com o visual HTML Content Secure
