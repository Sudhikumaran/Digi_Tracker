export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <Icon className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-500 mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
