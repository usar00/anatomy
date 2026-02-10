"use client";

import { motion } from "framer-motion";
import { SectionCard } from "./SectionCard";
import type { UnitWithSections } from "@/types/quiz";

interface UnitMapProps {
  units: UnitWithSections[];
}

export function UnitMap({ units }: UnitMapProps) {
  if (units.length === 0) {
    return (
      <div className="text-center py-16 text-secondary">
        <p className="text-lg">まだユニットがありません</p>
        <p className="text-sm mt-1">コンテンツが追加されるまでお待ちください</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {units.map((unit, unitIndex) => (
        <motion.div
          key={unit.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: unitIndex * 0.1 }}
        >
          {/* Unit header */}
          <div className="mb-6 px-2">
            <h2 className="text-lg font-bold text-foreground">
              ユニット {unit.sort_order + 1}
            </h2>
            <p className="text-base font-semibold text-primary">
              {unit.name}
            </p>
            {unit.description && (
              <p className="text-sm text-secondary mt-0.5">
                {unit.description}
              </p>
            )}
          </div>

          {/* Section path */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-card-border -translate-x-1/2 -z-10" />

            <div className="space-y-6 py-4">
              {unit.sections.map((section, sectionIndex) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
