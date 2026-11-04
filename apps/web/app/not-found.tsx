import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">Página não encontrada</h1>
      <p>O endereço que você abriu não existe.</p>
      <p className="mt-4">
        <Link href="/" className="underline">
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}
