import React from 'react';
import { Home, Pill, Activity, Users, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface MobileNavProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  currentUser: User | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentRoute,
  onRouteChange,
  currentUser
}) => {
  if (!currentUser) return null;

  const isCaregiver = currentUser.role === 'caregiver';

  const navItems = isCaregiver
    ? [
        { id: 'caregiver', label: 'Home', icon: Home },
        { id: 'caregiver-patients', label: 'Patients', icon: Users },
        { id: 'caregiver-escalations', label: 'Alerts', icon: Activity },
        { id: 'profile', label: 'Profile', icon: UserIcon }
      ]
    : [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'medicines', label: 'Medicines', icon: Pill },
        { id: 'health', label: 'Health', icon: Activity },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'profile', label: 'Profile', icon: UserIcon }
      ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/98 border-t border-[#E8E2D8] backdrop-blur-md px-2 py-1.5 safe-area-inset-bottom shadow-lg"
    >
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.id)}
              className={`flex flex-col items-center justify-center min-h-[50px] min-w-[56px] px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#1E3326] font-bold bg-[#EAE4D8]/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#F95518] stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
