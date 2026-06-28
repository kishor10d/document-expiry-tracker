/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Car, IdCard, Activity, Briefcase } from 'lucide-react';
import { DocCategory } from '../types';

interface CategoryBadgeProps {
  category: DocCategory;
  showIconOnly?: boolean;
}

export default function CategoryBadge({ category, showIconOnly = false }: CategoryBadgeProps) {
  const getCategoryDetails = (cat: DocCategory) => {
    switch (cat) {
      case DocCategory.VEHICLE:
        return {
          label: 'Vehicle & Transport',
          icon: Car,
          bgClass: 'bg-blue-50 text-blue-700 border-blue-200/50',
          darkBgClass: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'
        };
      case DocCategory.PERSONAL:
        return {
          label: 'Personal & Identity',
          icon: IdCard,
          bgClass: 'bg-purple-50 text-purple-700 border-purple-200/50',
          darkBgClass: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30'
        };
      case DocCategory.MEDICAL:
        return {
          label: 'Medical & Healthcare',
          icon: Activity,
          bgClass: 'bg-rose-50 text-rose-700 border-rose-200/50',
          darkBgClass: 'dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30'
        };
      case DocCategory.FINANCE:
        return {
          label: 'Finance & Banking',
          icon: Briefcase,
          bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
          darkBgClass: 'dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30'
        };
    }
  };

  const details = getCategoryDetails(category);
  const Icon = details.icon;

  if (showIconOnly) {
    return (
      <span className={`inline-flex items-center justify-center p-2 rounded-lg border ${details.bgClass} ${details.darkBgClass}`} title={details.label}>
        <Icon size={16} className="shrink-0" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${details.bgClass} ${details.darkBgClass}`}>
      <Icon size={12} className="shrink-0" />
      <span>{details.label}</span>
    </span>
  );
}
