# Galeria HTML Content Secure

Medidas DAX prontas para o visual **HTML Content Secure** (antigo *HTML Content (lite)*) no Power BI, cada uma com prévia ao vivo, botão de copiar e um playground que aponta o que a edição certificada vai bloquear.

Montado por **João Rossini**.

**Site:** https://caliljoao.github.io/Repositorio_HTMLcontent/

Quer um template novo? Abra uma [issue de pedido](../../issues/new?template=novo-template.md).

## Como usar

1. Abra a página e clique em **Usar template** (ou na prévia dele). O editor abre em tela cheia.
2. À esquerda, ajuste nome da medida, título, unidade, abreviação, se maior ou menor é melhor e as faixas de cor. A prévia e a medida DAX mudam na hora.
3. Quer mexer à mão? Edite na aba **HTML (editável)**: a medida DAX passa a ser gerada do seu HTML. **Desfazer e voltar ao template** retorna às opções.
4. Clique em **Copiar DAX**, troque `[Vendas]`, `[Meta]` e os outros nomes pelos do seu modelo e coloque a medida no campo *Values* do visual HTML Content Secure.

Tem um HTML seu ou feito com IA? Use **Abrir editor livre** (ou o link `#editor`). Escreva `{{pct}}` onde quiser o percentual do simulador.
Quer outra variação? **Copiar prompt para IA** leva as regras do visual e a medida atual.
Cada template tem link direto, ex.: `.../Repositorio_HTMLcontent/#gauge`.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `index.html` | A página: layout, filtros, simulador, playground |
| `templates.js` | Os templates (prévia em JS + medida DAX) |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos como estão |

## Publicar no GitHub Pages

Em **Settings → Pages**, escolha *Deploy from a branch*, depois a branch `main` e a pasta `/ (root)`.

## Incluir um template

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Regras da edição Secure (resumo)

- Sem `<script>`, `<iframe>`, `<form>`, `<link>` e atributos `on*`
- Sem recursos externos: `url(http…)`, `@import`, `@font-face` e imagens por URL são bloqueados
- `<style>`, `style` inline, `@keyframes` e SVG (exceto `<use>` e `<foreignObject>`) funcionam
- Números no CSS sempre com ponto: `FORMAT(x, "0.0", "en-US")`

Referência: [html-content.com/docs/sanitization](https://html-content.com/docs/sanitization)
