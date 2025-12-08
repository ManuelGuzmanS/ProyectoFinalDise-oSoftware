import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">LabTrack • SaaS de préstamos de laboratorio</p>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Visionamos laboratorios sin papeleo ni hojas de cálculo.
              </h1>
              <p className="text-base text-gray-600">
                LabTrack digitaliza el ciclo completo de préstamo: visibilidad del catálogo, solicitudes en línea y control de inventario para alumnos y encargados.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/catalog"
                  className="px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Ir al catálogo
                </Link>
                <Link
                  to="/requests"
                  className="px-5 py-3 border border-gray-300 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-100"
                >
                  Ver mis solicitudes
                </Link>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: 'Problema', desc: 'Registros manuales, poca visibilidad y retrasos en aprobaciones.' },
                { title: 'Solución', desc: 'Catálogo digital, solicitudes en línea y estados claros.' },
                { title: 'Valor', desc: 'Eficiencia, transparencia y accesibilidad 24/7.' },
                { title: 'Tecnología', desc: 'React + Vite + Tailwind con Firebase Auth/Firestore/Storage.' },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Catálogo actualizado', desc: 'Filtra y busca con disponibilidad visible.' },
            { title: 'Solicitudes en línea', desc: 'Fechas validadas, propósito y seguimiento.' },
            { title: 'Gestión de laboratorio', desc: 'Aprueba, entrega, devuelve y ajusta stock.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Valores clave</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Eficiencia: menos tiempo en trámites.</li>
              <li>Transparencia: estado visible de solicitudes y stock.</li>
              <li>Accesibilidad: web 24/7 desde cualquier dispositivo.</li>
              <li>Seguridad: registro auditado con Firebase.</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Público objetivo</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Estudiantes (ingeniería, computación, electrónica).</li>
              <li>Personal técnico de laboratorio.</li>
              <li>Administradores y coordinadores académicos.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
