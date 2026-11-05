import type { Metadata } from 'next';
import { SitemapPage } from '../../lib/templates/sitemap';

export const metadata: Metadata = { title: 'Mapa do site' };

// Hub de linkagem interna, obrigatorio no template padrao (templates.sitemap).
export default SitemapPage;
