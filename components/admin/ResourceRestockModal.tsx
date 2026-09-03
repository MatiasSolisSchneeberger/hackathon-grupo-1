"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { ResourceItem } from '@/types/shelter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PackagePlus, X } from 'lucide-react';

interface ResourceRestockModalProps {
  resource: ResourceItem;
  onClose: () => void;
}

export const ResourceRestockModal: React.FC<ResourceRestockModalProps> = ({ resource, onClose }) => {
  const { restockResource } = useShelter();
  const [amount, setAmount] = useState<number>(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      restockResource(resource.id, amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-lg">Reabastecer Insumo</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase">Insumo Seleccionado</label>
            <p className="font-bold text-base text-zinc-900 dark:text-zinc-100">{resource.name}</p>
            <p className="text-xs text-zinc-500">
              Categoría: <span className="capitalize">{resource.category}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs text-zinc-500 block">Stock Actual</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {resource.quantity} {resource.unit}
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Umbral Mínimo</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {resource.minThreshold} {resource.unit}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="restock-amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cantidad a agregar ({resource.unit})
            </label>
            <Input
              id="restock-amount"
              type="number"
              min="1"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="text-base font-semibold"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Confirmar Ingreso
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
