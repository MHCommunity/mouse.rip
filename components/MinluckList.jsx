export default function MinluckList({ minlucks }) {
  const minluckTypes = [
    'Arcane',
    'Draconic',
    'Forgotten',
    'Hydro',
    'Physical',
    'Shadow',
    'Tactical',
    'Law',
    'Rift',
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="-mx-4 mt-8 sm:-mx-0">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Mouse</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Arcane</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Draconic</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Forgotten</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Hydro</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Physical</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Shadow</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Tactical</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Law</th>
              <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Rift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {minlucks.map((minluck) => (
              <tr key={minluck.name} className="even:bg-slate-100">
                <td className="w-full sm:hidden max-w-0 py-4 pl-4 pr-3 sm:w-auto sm:max-w-none sm:pl-0">
                  <div className="flex items-center space-x-3 lg:pl-9 justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{minluck.name}</div>
                      <div className="mt-1 truncate text-xs text-gray-500">
                        <span className="mr-1">{minluck.group}</span>
                        <span>{minluck.subgroup && `(${minluck.subgroup})`}</span>
                      </div>
                    </div>
                    <div className="flex items-stretch flex-wrap flex-col w-23">
                      {minluckTypes.filter((type) => minluck[type] !== '∞').map((type) => (
                        <div key={type} className="flex items-center justify-between w-full text-xs text-gray-500">
                          <div className="w-20">{type}</div>
                          <div className="w-5 text-right font-mono">{minluck[type]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">{minluck.name}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Arcane}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Draconic}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Forgotten}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Hydro}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Physical}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Shadow}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Tactical}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Law}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{minluck.Rift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
