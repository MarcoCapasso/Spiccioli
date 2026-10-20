import type { ComponentProps, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: IconName;
  loading?: boolean;
  children: ReactNode;
};

//Il pulsante dell'app: variante, dimensione, icona e caricamento si scelgono con le props
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  loading = false,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    block && 'btn-block',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button {...rest} type={type} className={classes} disabled={disabled || loading}>
      {loading ? <span className="spinner" /> : icon && <Icon name={icon} />}
      {children}
    </button>
  );
}