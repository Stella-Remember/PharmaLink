import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'warning' | 'success';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-950/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
        };
      default:
        return {
          bg: 'bg-white dark:bg-gray-900',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-900 dark:text-white',
          iconBg: 'bg-gray-50 dark:bg-gray-800',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-lg border ${styles.bg} ${styles.border} p-5 transition-all hover:shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`mt-2 text-2xl font-semibold ${styles.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg p-2 ${styles.iconBg} ${styles.text}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;