import Image from 'next/image'
import clsx from 'clsx'

export default function PowerTypeBadge({ type, className, ...props }) {
  return (
    <Image
      src={`/images/power-types/${type.toLowerCase()}.png`}
      alt={props.alt || `${type} icon`}
      width={props.width || 32}
      height={props.height || 32}
      className={clsx('inline-block', className)}
      placeholder="empty"
    />
  )
}
