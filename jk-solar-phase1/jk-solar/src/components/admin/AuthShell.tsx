import { Logo } from '@/components/site/Logo';
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-navy to-royal p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="mb-1 text-center text-xl font-semibold text-navy">{title}</h1>
        {children}
      </div>
    </main>
  );
}
