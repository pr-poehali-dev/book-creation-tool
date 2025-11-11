import { cn } from '@/lib/utils';

type SwanDecorationProps = {
  position?: 'left' | 'right' | 'center';
  className?: string;
};

const SwanDecoration = ({ position = 'center', className }: SwanDecorationProps) => {
  const swanSvg = (
    <svg 
      viewBox="0 0 100 100" 
      className={cn("w-full h-full fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 20 Q55 15, 58 18 Q62 22, 60 28 Q58 35, 52 38 L48 40 Q40 42, 35 48 Q30 55, 28 65 Q26 75, 30 82 Q35 88, 42 88 L60 86 Q68 84, 72 78 Q75 72, 73 65 L70 55 Q68 48, 62 44 L55 42 Q52 40, 50 38 Q48 35, 48 32 Q48 28, 50 25 Q52 22, 54 22 Q56 22, 57 24 Q58 26, 56 28 Q54 30, 52 30 L50 32" 
        className="opacity-90"
      />
      <circle cx="56" cy="20" r="1.5" className="fill-black" />
    </svg>
  );

  if (position === 'center') {
    return (
      <div className="flex justify-center items-center gap-4 my-6">
        <div className="w-16 h-16 text-purple-300 transform -scale-x-100 opacity-60">
          {swanSvg}
        </div>
        <div className="w-20 h-20 text-purple-400">
          {swanSvg}
        </div>
        <div className="w-16 h-16 text-purple-300 opacity-60">
          {swanSvg}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed top-1/2 -translate-y-1/2 w-24 h-24 text-purple-200 opacity-30 pointer-events-none",
      position === 'left' ? 'left-4' : 'right-4',
      position === 'left' ? 'transform scale-x-[-1]' : ''
    )}>
      {swanSvg}
    </div>
  );
};

export default SwanDecoration;