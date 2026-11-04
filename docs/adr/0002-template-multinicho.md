# ADR 0002 - Template multinicho

- Status: aceito
- Data: 2026-11-03

## Contexto

A primeira versão dos manifests nasceu de um benchmark de moda e trazia esse
nicho embutido: facetas fixas de tamanho, cor, idade e modelagem; seletores de
cor e tamanho na PDP; "complete o look"; imagem de produto 3/4; atributos GEO
obrigatórios de vestuário (`size`, `pattern`, `audience`, `sizeGuideUrl`);
"sacola" como nome do carrinho.

A Nears atende qualquer varejo online. Uma loja de eletrônicos não tem tamanho e
uma de mercado não tem guia de medidas. Exigir esses campos quebraria o build
de quem não vende roupa.

## Decisão

Tudo o que varia por nicho sai do código e dos contratos e vai para dois blocos
em `nears/nears.config.yaml`:

- **`catalog`**: eixos de variação do SKU, facetas exibidas e indexáveis,
  atributos schema.org exigidos para GEO, tabela de especificação, guia
  auxiliar da PDP, eixo plano de navegação e proporção da imagem de produto.
- **`vocabulary`**: microcopy que muda por nicho ou marca (carrinho ou sacola,
  compre junto ou complete o look...).

Os outros manifests referenciam esses blocos (`from:`, `enabledBy:`) em vez de
listar valores. O default é `vertical: generic`: sem eixos de variação, facetas
por categoria, marca e preço, imagem quadrada e especificações em tabela.

Renomeações:

| Antes | Depois |
| --- | --- |
| `colorSelector`, `sizeSelector` | `variantSelectors` (um por eixo, sempre `radiogroup`) |
| `sizeGuideHref` | `guideHref` (liga com `catalog.guide.enabled`) |
| `composition`, `care`, `measurements` | `specs`, `instructions`, `guide` |
| `colorSwatches` | `variantPreview` |
| `pdp-buy-look` | `pdp-bundle` |
| rota `category-flat-fit` `/{productType}/{fit}` | `category-flat-attribute` `/{productType}/{attributeValue}` |
| `hasVariant { size, color }` | `hasVariant { axes: Record<eixo, valor> }` |
| GEO fixo `color, material, size, sizeGuideUrl, audience, pattern` | `additionalProperty` + `catalog.geoAttributes` |

## Presets por nicho

Ponto de partida. Copie o bloco para `catalog` e `vocabulary` e ajuste.

### Moda e calçados

```yaml
catalog:
  vertical: fashion
  productMedia: { aspect: portrait, hoverImage: true }
  variantAxes:
    - { id: color, label: Cor, display: swatch, schemaOrg: color }
    - { id: size, label: Tamanho, display: option, schemaOrg: size }
  facets:
    available: [category, size, color, price, brand]
    indexable: [category, color]
  geoAttributes: [color, size, material, audience]
  guide: { enabled: true, label: Guia de medidas }
  flatAxis: { enabled: true, secondLevelAttribute: fit }
vocabulary: { cart: Sacola, bundle: Complete o look }
```

### Eletrônicos e eletrodomésticos

```yaml
catalog:
  vertical: electronics
  productMedia: { aspect: product }
  variantAxes:
    - { id: color, label: Cor, display: swatch, schemaOrg: color }
    - { id: voltage, label: Voltagem, display: option }
    - { id: storage, label: Armazenamento, display: option }
  facets:
    available: [category, brand, price, voltage, storage]
    indexable: [category, brand]
  geoAttributes: [model, mpn, weight]
  guide: { enabled: true, label: Compatibilidade }
  flatAxis: { enabled: true, secondLevelAttribute: ~ }
vocabulary: { bundle: Compre junto }
```

### Casa e decoração

```yaml
catalog:
  vertical: home
  productMedia: { aspect: landscape }
  variantAxes:
    - { id: color, label: Cor, display: swatch, schemaOrg: color }
    - { id: dimensions, label: Tamanho, display: option }
  facets:
    available: [category, color, material, price]
    indexable: [category, material]
  geoAttributes: [color, material, width, height, depth]
  guide: { enabled: true, label: Medidas }
vocabulary: { bundle: Combine com }
```

### Beleza e cosméticos

```yaml
catalog:
  vertical: beauty
  productMedia: { aspect: product }
  variantAxes:
    - { id: shade, label: Tom, display: swatch, schemaOrg: color }
    - { id: volume, label: Volume, display: option }
  facets:
    available: [category, brand, price, skinType]
    indexable: [category, brand]
  geoAttributes: [brand, size]
  guide: { enabled: true, label: Modo de uso }
vocabulary: { cart: Sacola, bundle: Monte seu kit }
```

### Mercado e alimentos

```yaml
catalog:
  vertical: grocery
  productMedia: { aspect: product }
  variantAxes:
    - { id: weight, label: Peso, display: option, schemaOrg: weight }
  facets:
    available: [category, brand, price, dietary]
    indexable: [category, brand]
  geoAttributes: [brand, weight]
  guide: { enabled: true, label: Tabela nutricional }
  flatAxis: { enabled: false }
vocabulary: { cart: Cesta, bundle: Leve também }
```

### Pet

```yaml
catalog:
  vertical: pet
  productMedia: { aspect: product }
  variantAxes:
    - { id: weight, label: Peso, display: option, schemaOrg: weight }
    - { id: petSize, label: Porte, display: option }
  facets:
    available: [category, brand, price, petSize, species]
    indexable: [category, brand, species]
  geoAttributes: [brand, weight]
  guide: { enabled: true, label: Guia de porte }
```

## Consequências

- Uma loja nova escolhe um preset, ajusta, troca `tokens.json` e a fonte. O
  código não muda.
- A Fase 2 ganha mais trabalho: os schemas Zod precisam resolver as referências
  `from:` e `enabledBy:` e gerar os tipos de `variantAxes` e das facetas a partir
  do `catalog` da loja.
- Os gates de GEO deixam de cobrar atributos de vestuário de quem não vende
  roupa. Continuam exigindo os três campos universais e os `geoAttributes` do
  nicho escolhido.
- `vertical` é só um rótulo. Comportamento nunca pode depender dele: se algo
  muda por nicho, vira campo explícito no `catalog`.
