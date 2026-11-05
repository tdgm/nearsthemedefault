// Fonte unica de dados do app. Hoje serve o mock de desenvolvimento; quando o
// backend publicar o schema GraphQL, `loadSnapshot` troca de fonte aqui (via
// graphqlRequest) sem tocar em rota nem em section. Sempre validado por Zod.
import { catalogSnapshotSchema, type CatalogSnapshot, type Campaign, type Department, type Longtail, type Page, type Product, type ProductType } from './schemas';
import { mockSnapshot } from './mock';

let cached: CatalogSnapshot | undefined;

export async function getSnapshot(): Promise<CatalogSnapshot> {
  cached ??= catalogSnapshotSchema.parse(mockSnapshot);
  return cached;
}

export async function getStore() {
  return (await getSnapshot()).store;
}
export async function getDepartments(): Promise<Department[]> {
  return (await getSnapshot()).departments;
}
export async function getProductTypes(): Promise<ProductType[]> {
  return (await getSnapshot()).productTypes;
}
export async function getCampaigns(): Promise<Campaign[]> {
  return (await getSnapshot()).campaigns;
}
export async function getPages(): Promise<Page[]> {
  return (await getSnapshot()).pages;
}
export async function getLongtails(): Promise<Longtail[]> {
  return (await getSnapshot()).longtails;
}
export async function getProducts(): Promise<Product[]> {
  return (await getSnapshot()).products;
}
