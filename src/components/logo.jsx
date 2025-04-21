import clsx from 'clsx';

export function Logo({ className, ...props }) {
  return (
    <span
      data-slot="logo"
      { ...props }
      className={ clsx(className, 'inline-grid shrink-0 align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1 rounded-full *:rounded-full') }
    >
      <img className="size-full max-h-6 max-w-6" src="/images/logo.png" alt="mouse.rip" />
	</span>
  );
}
