import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-lg font-semibold">Sistema de Citas</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-4">
                {session?.user?.name} ({session?.user?.role})
              </span>
              <Link href="/api/auth/signout" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Bienvenido al Sistema de Citas</h1>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Dashboard de Administración</h3>
                <p className="mt-2 text-sm text-gray-500">Ver todas las citas y generar reportes.</p>
              </Link>
            )}
            {(session?.user?.role === 'MEDICO' || session?.user?.role === 'ADMIN') && (
              <Link href="/medico/horarios" className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Horarios</h3>
                <p className="mt-2 text-sm text-gray-500">Administrar disponibilidad y horarios.</p>
              </Link>
            )}
            <Link href="/citas" className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Mis Citas</h3>
              <p className="mt-2 text-sm text-gray-500">Ver, reservar o cancelar citas.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}