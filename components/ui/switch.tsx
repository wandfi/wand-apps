import { cn } from '@/lib/utils'
import { useThemeState } from '../theme-mode';

export function Switch(p: { checked?: boolean; onChange?: (check?: boolean) => void }) {
  const ts = useThemeState()

  return (
    <div
      style={{
        padding: 1,
        border: '1px solid transparent',
        backgroundRepeat: 'no-repeat',
        backgroundClip: 'padding-box,border-box',
        backgroundOrigin: 'padding-box,border-box',
        backgroundImage: !p.checked
          ? ts.theme == 'light' ? 'radial-gradient(#FAFAFA,#FAFAFA),radial-gradient(#0A1114,#0A1114)' : 'radial-gradient(#0A1114,#0A1114),radial-gradient(#4A5546,#4A5546)'
          : 'radial-gradient(#0B1215,#0B1215),radial-gradient(122.5% 122.5% at 52.9% 16.25%, #6366F1 0%, #6366F1 36.26%, #6366F1 92.54%)',
      }}
      className={cn('relative h-[1em] w-[2.5em] cursor-pointer rounded-[0.4em] text-xl')}
      onClick={() => p.onChange?.(!p.checked)}
    >
      <div
        className={cn('transition-all h-full w-[1.5em] absolute top-0 rounded-[0.4em]', p.checked ? 'left-[1em]' : '-left-[1px]')}
        style={{
          background: !p.checked
            ? '#3B4144'
            : 'radial-gradient(76.25% 76.25% at 50.3% 23.75%, #6366F1 0%, #6366F1 100%)',
        }}
      />
    </div>
  )
}


export function Switch2(p: { checked?: boolean; onChange?: (check?: boolean) => void }) {
  const toggleSwitch = () => {
    p.onChange?.(!p.checked)
  };
  return <div className={cn("relative inline-block w-12 h-6")}>
    <input
      type="checkbox"
      className="absolute opacity-0 w-0 h-0"
      checked={p.checked}
      onChange={toggleSwitch}
    />
    <div
      className={`absolute inset-0 bg-gray-300 rounded-full transition duration-200 ease-in-out cursor-pointer ${p.checked ? 'bg-blue-500' : ''}`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-6 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${p.checked ? 'translate-x-full' : ''}`}
      ></div>
    </div>
  </div>
}