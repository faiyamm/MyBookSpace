import React from 'react';
import BaseCard from './BaseCard';

/**
 * StatsCard - Specialized card for displaying statistics
 * Follows Open/Closed Principle - extends BaseCard without modifying it
 */
export default function StatsCard({ 
  label, 
  value, 
  subtitle, 
  icon: Icon,
  valueColor = 'text-[#2C3E2C]',
  iconColor = 'text-[#5F7464]',
  className = ''
}) {
  return (
    <BaseCard className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[#5F7464] font-medium mb-2">{label}</p>
          <p className={`text-4xl font-bold ${valueColor} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-[#5F7464]">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${iconColor}`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </BaseCard>
  );
}
