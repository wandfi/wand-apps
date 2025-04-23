import { cn } from '@/lib/utils'
import { useThemeState } from '../theme-mode';
import { round } from 'lodash';

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


export function Switch2(p: { size?: number, border?: number, checked?: boolean; onChange?: (check?: boolean) => void, className?: string }) {
  const border = p.border ?? 1
  const msize = p.size ?? 16;
  const bollWidth = round(msize * 1.2)
  const bollHeight = round(msize)
  const width = round(bollWidth * 2 + 2 * border)
  const height = round(msize + 2 * border)
  const toggleSwitch = () => {
    p.onChange?.(!p.checked)
  };
  return <div style={{ borderWidth: border, height, width }} className={cn("relative inline-block bg-gray-300 rounded-full border-primary transition duration-200 ease-in-out cursor-pointer", p.checked && 'bg-primary', p.className)} onClick={toggleSwitch}>
    <div
      style={{ width: bollWidth, height: bollHeight }}
      className={cn(`left-0 w-6 bg-white dark:bg-black rounded-full shadow-md transform transition duration-200 ease-in-out`, p.checked && 'translate-x-full')}
    />

  </div>
}