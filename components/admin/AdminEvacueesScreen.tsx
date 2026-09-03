"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, FileSpreadsheet } from 'lucide-react';

export const AdminEvacueesScreen: React.FC = () => {
  const { estadias, personas, refugios, gruposFamiliares, cargando, errorCarga } = useShelter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refugioFilter, setRefugioFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('activas');

  const filteredEstadias = estadias.filter((estadia) => {
    const persona = personas.find((p) => p.id === estadia.persona_id);
    if (!persona) return false;

    const matchSearch =
      persona.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (persona.numero_documento && persona.numero_documento.includes(searchQuery));
    
    const matchRefugio = refugioFilter === 'all' || estadia.refugio_id === Number(refugioFilter);
    const matchEstado = 
      estadoFilter === 'todas' ||
      (estadoFilter === 'activas' && !estadia.fecha_egreso) ||
      (estadoFilter === 'egresadas' && Boolean(estadia.fecha_egreso));

    return matchSearch && matchRefugio && matchEstado;
  });

  const handleExport = () => {
    const escapeCsv = (value: string | number | null | undefined) => {
      const text = String(value ?? '').replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = filteredEstadias.map((estadia) => {
      const persona = personas.find((p) => p.id === estadia.persona_id);
      const refugio = refugios.find((r) => r.id === estadia.refugio_id);
      const grupo = gruposFamiliares.find((g) => g.id === estadia.grupo_id);
      return [
        `${persona?.apellido ?? ''}, ${persona?.nombre ?? ''}`,
        persona?.tipo_documento,
        persona?.numero_documento,
        refugio?.nombre ?? estadia.refugio_id,
        grupo?.codigo ?? 'Sin grupo',
        estadia.vinculo,
        estadia.fecha_ingreso,
        estadia.fecha_egreso ? 'Egresada' : 'Activa',
        persona?.observaciones ?? estadia.observaciones,
      ].map(escapeCsv).join(',');
    });

    const header = ['Persona', 'Tipo documento', 'Numero documento', 'Refugio', 'Grupo', 'Vinculo', 'Fecha ingreso', 'Estado', 'Observaciones'];
    const csv = [header.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `padron-evacuados-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (cargando) {
    return <Card className="p-6 text-sm text-zinc-500">Cargando padrón de estadías...</Card>;
  }

  if (errorCarga) {
    return <Card role="alert" className="p-6 text-sm text-red-700 dark:text-red-300">{errorCarga}</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Padrón Consolidado de Estadías y Personas (Tabla public.estadias)</CardTitle>
            <CardDescription>
              Base de datos centralizada alimentada en tiempo real por los Trabajadores Sociales en cada refugio.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={cargando || filteredEstadias.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
            Exportar Padrón Global
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar por Nombre, Apellido o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={refugioFilter}
            onChange={(e) => setRefugioFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos los Refugios</option>
            {refugios.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
          >
            <option value="activas">🟢 Estadías Activas (Sin Egreso)</option>
            <option value="egresadas">⚪ Estadías Concluidas (Egresados)</option>
            <option value="todas">Todas las Estadías</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
            <tr>
              <th className="py-3 px-4">Persona Albergada</th>
              <th className="py-3 px-4">Documento / Género</th>
              <th className="py-3 px-4">Refugio Albergue</th>
              <th className="py-3 px-4">Grupo / Vínculo</th>
              <th className="py-3 px-4">Observaciones Persona</th>
              <th className="py-3 px-4">Estado Estadía</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredEstadias.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500">
                  No se encontraron estadías con los criterios seleccionados.
                </td>
              </tr>
            ) : (
              filteredEstadias.map((estadia) => {
                const persona = personas.find((p) => p.id === estadia.persona_id);
                const refugio = refugios.find((r) => r.id === estadia.refugio_id);
                const grupo = gruposFamiliares.find((g) => g.id === estadia.grupo_id);

                if (!persona) return null;

                return (
                  <tr key={estadia.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {persona.apellido}, {persona.nombre}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Ingreso: {new Date(estadia.fecha_ingreso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-zinc-800 dark:text-zinc-200">
                        {persona.tipo_documento.toUpperCase()}: {persona.numero_documento || 'Sin doc'}
                      </div>
                      <div className="text-xs text-zinc-500 capitalize">{persona.genero}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold block text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        {refugio ? refugio.nombre.split('-')[0] : `Refugio N° ${estadia.refugio_id}`}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {grupo ? (
                        <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs">
                          {grupo.codigo} ({grupo.apellido_referencia})
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 block">Sin grupo</span>
                      )}
                      <span className="text-xs text-zinc-500 capitalize">{estadia.vinculo.replace('_', ' ')}</span>
                    </td>

                    <td className="py-3 px-4 text-xs text-zinc-700 dark:text-zinc-300">
                      {persona.observaciones || estadia.observaciones ? (
                        <p className="line-clamp-2">
                          {persona.observaciones} {estadia.observaciones ? `[Estadía: ${estadia.observaciones}]` : ''}
                        </p>
                      ) : (
                        <span className="text-zinc-400 italic">Sin observaciones</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {!estadia.fecha_egreso ? (
                        <Badge variant="success">ACTIVA (INGRESADO)</Badge>
                      ) : (
                        <div>
                          <Badge variant="secondary">EGRESADO</Badge>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            Motivo: {estadia.motivo_egreso}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
