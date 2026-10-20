import type { ComponentProps } from 'react';
import { Icon, type IconName } from './Icon';

type IconButtonProps = ComponentProps<'button'> & {
  icon: IconName;
  //Obbligatoria: un pulsante senza testo ha bisogno di un nome per chi usa il lettore di schermo
  label: string;
  danger?: boolean;
};

//Un pulsante con sola icona: l'etichetta compare al passaggio del mouse e viene letta dai lettori di schermo
export function IconButton({ icon, label, danger = false, className, type = 'button', ...rest }: IconButtonProps) {
  const classes = ['icon-btn', danger && 'danger', className].filter(Boolean).join(' ');

  return (
    <button {...rest} type={type} className={classes} aria-label={label} title={label}>
      <Icon name={icon} />
    </button>
  );
}