# Como incluir um template

Cada template é um objeto no array `T` em `templates.js`. Para incluir um novo, acrescente um objeto ao fim do array:

```js
{
  id: 'meu-template',          // único, sem espaços
  nome: 'Nome que aparece no card',
  cat: 'KPIs',                 // KPIs | Barras | SVG | Listas | Status
  desc: 'Uma frase dizendo o que ele mostra.',
  req: '<code>[Vendas]</code>, <code>[Meta]</code>',   // o que trocar no modelo
  html: d => `<div style='...'>${n0(d.vendas)}</div>`,  // prévia com dados de exemplo
  dax: `Minha Medida =
VAR _x = [Vendas]
RETURN
"<div style='...'>" & FORMAT ( _x, "#,0" ) & "</div>"`
}
```

`d` traz dados de exemplo que mudam com o simulador: `s` (atingimento, 0,4 a 1,3), `meta`, `vendas`, `aa` (ano anterior) e `varp` (variação vs ano anterior).

Funções auxiliares disponíveis: `n0` (número pt-BR), `pc` (percentual pt-BR), `f` (2 casas com ponto), `card` (estilo base de card), `MES` e `CATS` (séries de exemplo).

## Checklist do PR

- [ ] A medida não usa nada que o Secure bloqueia (cole o HTML no playground da página para conferir)
- [ ] Todo número que vai para CSS ou SVG usa `FORMAT(x, "...", "en-US")`
- [ ] Atributos HTML com aspas simples dentro das strings DAX
- [ ] A prévia (`html`) gera o mesmo HTML que a medida (`dax`)
- [ ] Testado num relatório Power BI com o visual HTML Content Secure
