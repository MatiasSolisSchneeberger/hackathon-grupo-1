"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Heart, MapPin, Building, ArrowRight } from 'lucide-react';

export const FamilySearchModal: React.FC = () => {
  const { evacuees, zones } = useShelter();
  const [searchTerm, setSearchTerm] = useState('');

  // Group evacuees by family group ID or surname
  const matchingEvacuees = evacuees.filter((e) => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return (
      e.lastName.toLowerCase().includes(term) ||
      e.firstName.toLowerCase().includes(term) ||
      (e.familyGroupId && e.familyGroupId.toLowerCase().includes(term)) ||
      e.originNeighborhood.toLowerCase().includes(term)
    );
  });

  // Group results by familyGroupId
  const familyGroupsMap = matchingEvacuees.reduce((acc, curr) => {
    const key = curr.familyGroupId || `INDIV-${curr.lastName.toUpperCase()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, typeof evacuees>);

  return (
    <Card className="border-t-4 border-t-purple-600 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-xl">Herramienta de Reunificación & Búsqueda Familiar</CardTitle>
        </div>
        <CardDescription>
          Consulte la localización e integrantes de familias relocalizadas en el refugio para facilitar el contacto de parientes o rescatistas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Ingrese apellido de la familia, código de grupo o barrio de origen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base py-5"
          />
        </div>

        {!searchTerm.trim() ? (
          <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Users className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Buscador de Grupos Familiares</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Escriba un apellido (ej: &quot;Gómez&quot;) o barrio (ej: &quot;Las Riveras&quot;) para visualizar los integrantes registrados y su zona asignada.
            </p>
          </div>
        ) : Object.keys(familyGroupsMap).length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            No se hallaron coincidencias para &quot;<strong>{searchTerm}</strong>&quot;.
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Coincidencias Encontradas ({Object.keys(familyGroupsMap).length} Grupos)
            </h4>

            {Object.entries(familyGroupsMap).map(([groupId, groupEvacuees]) => (
              <div
                key={groupId}
                className="p-5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-bold text-lg text-purple-900 dark:text-purple-200">
                      Grupo Familiar: {groupId}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-purple-300 text-purple-800 dark:text-purple-300">
                    {groupEvacuees.length} Integrantes albergados
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupEvacuees.map((member) => {
                    const zone = zones.find((z) => z.id === member.zoneId);

                    return (
                      <div
                        key={member.id}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {member.lastName}, {member.firstName}
                          </span>
                          <span className="text-xs text-zinc-500">{member.age} años</span>
                        </div>

                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Origen: {member.originNeighborhood}</span>
                        </div>

                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 pt-1">
                          <Building className="h-3.5 w-3.5" />
                          <span>{zone ? zone.name : member.zoneId}</span>
                          <span>(Cama {member.bedNumber || 'N/A'})</span>
                        </div>

                        {member.vulnerabilities.hasChronicCondition || member.vulnerabilities.isPregnant ? (
                          <p className="text-[11px] text-purple-700 dark:text-purple-300 pt-1 font-medium">
                            ⚠️ Atención médica especial registrada
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
