// components/common/Badge.tsx
interface BadgeProps {
    label: string;
    icon: string; // e.g., "🏆"
  }
  
  export const Badge = ({ label, icon }: BadgeProps) => {
    return (
      <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
        <span>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };