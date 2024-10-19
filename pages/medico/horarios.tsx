import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function GestionHorarios() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horarios, setHorarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'MEDICO' && session?.user?.role !== 'ADMIN')) {
      router.push('/');
    } else {
      fetchHorarios();
    }
  }, [status, session, router]);

  const fetchHorarios = async () => {
    const response = await fetch('/api/medico/horarios');
    const data = await response.json();
    setHorarios(data.map(horario => ({
      ...horario,
      start: new Date(horario.start),
      end: new Date(horario.end),
    })));
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const handleCreateHorario = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/medico/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: selectedSlot.start,
        end: selectedSlot.end,
      }),
    });
    if (response.ok) {
      setShowModal(false);
      fetchHorarios();
    } else {
      console.error('Error al crear el horario');
    }
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Horarios</h1>
      <Calendar
        localizer={localizer}
        events={horarios}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        selectable={true}
      />
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Crear Horario Disponible</h3>
            <form onSubmit={handleCreateHorario}>
              <div className="mb-4">
                <p>Inicio: {moment(selectedSlot.start).format('LLLL')}</p>
                <p>Fin: {moment(selectedSlot.end).format('LLLL')}</p>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}