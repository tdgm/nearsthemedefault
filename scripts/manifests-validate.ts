// Valida os 4 YAML de /nears com os schemas Zod de @nears/manifests e roda
// os checks cruzados (referencias from:/enabledBy:, invariantes de rotas,
// regra priority:inherit do section registry). Substitui o stub da Fase 0
// (so fazia parse + alguns invariantes de routes.manifest.yaml) - ver
// docs/ROADMAP.md > Fase 2 e docs/adr/0012.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllManifests, ManifestValidationError, runCrossChecks } from '@nears/manifests';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const nearsDir = resolve(repoRoot, 'nears');

const FILES = ['nears.config.yaml', 'routes.manifest.yaml', 'sections.registry.yaml', 'contracts.yaml'];

try {
  const manifests = loadAllManifests(nearsDir);
  for (const file of FILES) console.log(`ok      ${file}`);

  const crossCheckErrors = runCrossChecks(manifests);
  if (crossCheckErrors.length) {
    console.error('\nFALHOU (checks cruzados)\n' + crossCheckErrors.map((e) => `  - ${e}`).join('\n') + '\n');
    process.exit(1);
  }

  console.log('\nManifests validos: schema Zod + checks cruzados (referencias, rotas, section registry).\n');
} catch (error) {
  if (error instanceof ManifestValidationError) {
    console.error(`\nFALHOU\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
