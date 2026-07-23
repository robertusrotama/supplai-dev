"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROVINCE_GROUPS as REGIONAL_GROUPS } from "@/data/province-groups";

interface CityFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSelected: string[];
  onApply: (selected: string[]) => void;
}

export function CityFilterModal({ isOpen, onClose, currentSelected, onApply }: CityFilterModalProps) {
  // State lokal untuk menyimpan perubahan sementara sebelum di-apply
  const [localSelected, setLocalSelected] = useState<string[]>(currentSelected);

  if (!isOpen) return null;

  const toggleCity = (city: string) => {
    setLocalSelected(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleGroup = (groupCities: string[]) => {
    const hasAll = groupCities.every(c => localSelected.includes(c));
    if (hasAll) {
      setLocalSelected(prev => prev.filter(c => !groupCities.includes(c)));
    } else {
      setLocalSelected(prev => Array.from(new Set([...prev, ...groupCities])));
    }
  };

  const handleApply = () => {
    onApply(localSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal Box */}
      <div className="relative bg-white border border-slate-200 w-full max-w-3xl rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-[#006c4a]" />
            Filter Cakupan Wilayah Matriks
          </div>
          <button onClick={onClose} className="hover:bg-slate-100 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content (Grid Checklist) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50">
          {Object.entries(REGIONAL_GROUPS).map(([groupName, cities]) => {
            const hasAll = cities.every(c => localSelected.includes(c));
            return (
              <div key={groupName} className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800">{groupName}</span>
                    <button 
                      type="button"
                      onClick={() => toggleGroup(cities)}
                      className="text-[10px] font-mono font-bold text-[#006c4a] hover:underline"
                    >
                      {hasAll ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.map((city) => (
                      <label key={city} className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={localSelected.includes(city)}
                          onChange={() => toggleCity(city)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-[#006c4a] cursor-pointer"
                        />
                        {city}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl font-medium">
            Batal
          </Button>
          <Button size="sm" onClick={handleApply} className="bg-[#006c4a] hover:bg-[#005237] text-white rounded-xl font-medium">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}