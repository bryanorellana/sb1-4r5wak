import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function Citas() {
  const { data: session } = useSession();
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    const response = await fetch('/api/citas');
    const data = await response.json();
    setCitas(data.map(cita => ({
      ...cita,
      start: new Date(cita.fecha),
      end: new Date(new Date(cita.fecha).getTime() + 60*60*1000),
      title: `Cita: ${cita.description || 'Sin descripción'}`
    })));
  };

  const handleSelectSlot = (slotInfo) => {
    if (session?.user?.role === 'CLIENTE') {
      setSelectedDate(slotInfo.start);
      setSelectedCita(null);
      setShowModal(true);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedCita(event);
    setSelectedDate(event.start);
    setShowModal(true);
  };

  const handleCreateOrUpdateCita = async (e) => {
    e.preventDefault();
    const description = e.target.description.value;
    const method = selectedCita ? 'PUT' : 'POST';
    const url = selectedCita ? `/api/citas/${selectedCita.id}` : '/api/citas';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: selectedDate, description }),
    });
    
    if (response.ok) {
      setShowModal(false);
      fetchCitas();
    } else {
      console.error('Error al crear o actualizar la cita');
    }
  };

  const handleCancelCita = async () => {
    if (selectedCita) {
      const response = await fetch(`/api/citas/${selectedCita.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchCitas();
      } else {
        console.error('Error al cancelar la cita');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calendario de Citas</h1>
      <Calendar
        localizer={localizer}
        events={citas}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={session?.user?.role === 'CLIENTE'}
      />
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              {selectedCita ? 'Actualizar Cita' : 'Reservar Cita'}
            </h3>
            <form onSubmit={handleCreateOrUpdateCita}>
              <input type="hidden" name="fecha" value={selectedDate} />
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  defaultValue={selectedCita?.description || ''}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
                {selectedCita && (
                  <button type="button" onClick={handleCancelCita} className="mr-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Cancelar Cita</button>
                )}
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {selectedCita ? 'Actualizar' : 'Reservar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}