import { NavLink } from 'react-router-dom';

export default function AdminTabs() {
  const tabs = [
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/units', label: 'Units' },
  ];
  return (
    <div className="flex gap-2 bg-surface-container-low p-1 rounded-full w-fit mb-lg">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `px-5 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
              isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
