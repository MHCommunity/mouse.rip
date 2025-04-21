import { Heading } from '@/components/heading';
import { notFound } from 'next/navigation';

let item;

const getItem = async (id) => {
  return await fetch(`https://api.mouse.rip/item/${id}`).then((res) => res.json());
};

export async function generateMetadata({ params }) {
  item = item || await getItem(params.id);

  return {
    title: item.name,
  };
}

export default async function Location({ params }) {
  item = item || await getItem(params.id);

  if (! item) {
    notFound();
  }

  return (
    <>
      <Heading>{ item.name }</Heading>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            { /* <Image src={item.images.best} alt={item.name} width={200} height={200} /> */ }
	</div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{ item.name }</div>
            <p className="mt-2 text-gray-500">{ item.description }</p>
	</div>
	</div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Tags</div>
          <p className="mt-2 text-gray-500">{ item.tags }</p>
	</div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Environment</div>
          <p className="mt-2 text-gray-500">{ item.environment }</p>
	</div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Classification</div>
          <p className="mt-2 text-gray-500">{ item.classification }</p>
	</div>
	</div>
	</>
  );
}
