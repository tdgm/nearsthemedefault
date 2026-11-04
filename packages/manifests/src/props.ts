// Converte o DSL de `props` do sections.registry.yaml em schemas Zod
// ("Props sao validadas por Zod gerado deste arquivo"). Sao resolvidos aqui:
//   from:      lista fechada pelo nicho (facetas, eixos de variacao)
//   enabledBy: campo so existe se a flag do catalogo estiver ligada
//   default:   "vocabulary.x" vira o texto do vocabulario da loja
import { z } from 'zod';
import { resolveRef, type RefContext } from './refs.ts';
import type { PropDef, PropType, Section } from './schemas/sections.ts';

const isFull = (d: PropDef): d is Extract<PropDef, { type: PropType }> =>
  typeof d === 'object' && d !== null && 'type' in d && typeof (d as { type: unknown }).type === 'string';

const url = z.string().regex(/^(https?:\/\/|\/)\S*$/, 'use URL absoluta (http/https) ou caminho iniciado em "/"');

/** Toda imagem declara dimensoes (CLAUDE.md > Performance), para reservar espaco e evitar CLS. */
export const imageSchema = z.strictObject({
  src: url,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
});

/** Valor em reais (config.currency). Formatacao BR fica em /lib/format. */
export const moneySchema = z.number().nonnegative();

/** Tabela semantica: vira <table> com <th scope>, nunca imagem (CLAUDE.md > SEO e GEO). */
export const tableSchema = z.strictObject({
  caption: z.string().optional(),
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())),
});

const primitive = (type: PropType): z.ZodType => {
  switch (type) {
    case 'string':
    case 'richtext':
    case 'ref':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'url':
      return url;
    case 'image':
      return imageSchema;
    case 'money':
      return moneySchema;
    case 'datetime':
      return z.iso.datetime({ offset: true });
    case 'table':
      return tableSchema;
    case 'array':
      return z.array(z.unknown());
    case 'object':
      return z.record(z.string(), z.unknown());
    case 'enum':
      return z.never();
  }
};

/** Schema do tipo, sem opcionalidade, padrao nem enabledBy (usado direto em `of`). */
function bare(def: PropDef, ctx: RefContext, where: string): z.ZodType {
  if (typeof def === 'number') return z.number();
  if (typeof def === 'boolean') return z.boolean();
  if (typeof def === 'string') return primitive(def);
  if (!isFull(def)) return shape(def, ctx, where);
  switch (def.type) {
    case 'enum': {
      const values = (def.values ?? []).map(String);
      if (!values.length) throw new Error(`${where}: enum sem values`);
      return z.enum(values as [string, ...string[]]);
    }
    case 'array':
      return arraySchema(def, ctx, where);
    case 'object':
      return def.props ? shape(def.props, ctx, where) : primitive('object');
    case 'number': {
      let n = z.number();
      if (def.min !== undefined) n = n.min(def.min);
      if (def.max !== undefined) n = n.max(def.max);
      return n;
    }
    default:
      return primitive(def.type);
  }
}

function build(def: PropDef, ctx: RefContext, where: string): z.ZodType {
  if (typeof def === 'number') return z.number().default(def);
  if (typeof def === 'boolean') return z.boolean().default(def);
  const schema = bare(def, ctx, where);
  if (!isFull(def)) return schema.optional();

  if (def.enabledBy) {
    const flag = resolveRef(def.enabledBy, ctx);
    // Recurso desligado no nicho: o campo nem pode ser enviado.
    if (!(flag.ok && Boolean(flag.value))) return z.never().optional();
  }
  if (def.default !== undefined) return schema.default(resolveDefault(def.default, ctx, where) as never);
  return def.required ? schema : schema.optional();
}

function arraySchema(def: Extract<PropDef, { type: PropType }>, ctx: RefContext, where: string): z.ZodType {
  if (def.from) {
    const list = resolveRef(def.from, ctx);
    if (!list.ok || !Array.isArray(list.value)) throw new Error(`${where}: from ${def.from} nao e lista`);
    const items: unknown[] = list.value;
    if (items.length === 0) return z.array(z.never()).max(0); // ex.: nicho sem eixos de variacao
    if (items.every((i) => typeof i === 'string')) return z.array(z.enum(items as [string, ...string[]]));
    const ids = items.map((i) => (i as { id: string }).id);
    return z.array(z.looseObject({ id: z.enum(ids as [string, ...string[]]) }));
  }
  let arr = z.array(def.of === undefined ? z.unknown() : bare(def.of, ctx, `${where}[]`));
  if (def.min !== undefined) arr = arr.min(def.min);
  if (def.max !== undefined) arr = arr.max(def.max);
  return arr;
}

function resolveDefault(value: unknown, ctx: RefContext, where: string): unknown {
  if (typeof value === 'string' && value.startsWith('vocabulary.')) {
    const r = resolveRef(value, ctx);
    if (!r.ok) throw new Error(`${where}: default ${value} -> ${r.reason}`);
    return r.value;
  }
  return value;
}

function shape(props: Record<string, PropDef>, ctx: RefContext, where: string): z.ZodObject {
  const fields: Record<string, z.ZodType> = {};
  for (const [name, def] of Object.entries(props)) fields[name] = build(def, ctx, `${where}.${name}`);
  return z.strictObject(fields);
}

/** Schema Zod das props de uma section, com o catalogo da loja aplicado. */
export function propsSchema(section: Pick<Section, 'id' | 'props'>, ctx: RefContext): z.ZodObject {
  return shape(section.props, ctx, section.id);
}
