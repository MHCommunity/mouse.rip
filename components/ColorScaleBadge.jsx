import clsx from 'clsx'

export default function ColorScaleBadge({ value = 0, className = '' }) {
  value = Math.round(value)

  if (value < 10) {
    return <div className={clsx('rounded-lg my-1 p-1.5 mr-1 text-sm bg-blue-100 text-blue-800', className)}>{value}</div>
  } else if (value < 40) {
    return <div className={clsx('rounded-lg my-1 p-1.5 mr-1 text-sm bg-green-300 text-green-800', className)}>{value}</div>
  } else if (value < 100) {
    return <div className={clsx('rounded-lg my-1 p-1.5 mr-1 text-sm bg-yellow-100 text-yellow-800', className)}>{value}</div>
  } else if (value > 300) {
    return <div className={clsx('rounded-lg my-1 p-1.5 mr-1 text-sm bg-red-100 text-red-800', className)}>{value}</div>
  } else {
    return <div className={clsx('rounded-lg my-1 p-1.5 mr-1 text-sm bg-slate-300 text-slate-800', className)}>{value}</div>
  }
}
