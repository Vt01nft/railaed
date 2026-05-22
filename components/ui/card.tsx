import * as React from 'react';

type Variant = 'default' | 'gradient' | 'deep';

const variants: Record<Variant, string> = {
  default:  'rounded-3xl card-luxe',
  gradient: 'rounded-3xl gradient-border',
  deep:     'rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]',
};

export function Card({
  className = '',
  variant = 'default',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={`${variants[variant]} ${className}`} {...rest} />;
}

export function CardHeader({ className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-3 ${className}`} {...rest} />;
}

export function CardTitle({ className = '', ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-serif text-xl font-medium tracking-tight text-[color:var(--cream-200)] ${className}`}
      {...rest}
    />
  );
}

export function CardDescription({ className = '', ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-[color:var(--cream-400)] ${className}`} {...rest} />;
}

export function CardContent({ className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-3 ${className}`} {...rest} />;
}

export function CardFooter({ className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-3 border-t border-[color:var(--border)] ${className}`} {...rest} />;
}
