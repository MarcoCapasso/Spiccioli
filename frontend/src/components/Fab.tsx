import type { ComponentProps } from 'react';
import { Icon, type IconName } from './Icon';

type FabProps = ComponentProps<'button'> & {
  icon: IconName;
  label: string;
};

//Il pulsante flottante, visibile solo sul telefono
export function Fab({ icon, label, ...rest }: FabProps) {
  return (
    <button {...rest} type="button" className="fab" aria-label={label} title={label}>
      <Icon name={icon} />
    </button>
  );
}