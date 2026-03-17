import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '../../utils/formatters';

export default function PropertyCard({ property }) {
  const thumbnail =
    property.images && property.images.length > 0
      ? property.images[0].url
      : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link href={`/properties/${property._id}`} className="card group">
      <div className="relative h-48 w-full">
        <Image
          src={thumbnail}
          alt={property.propertyName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {property.nsfasAccredited && (
          <span className="absolute top-2 left-2 badge-nsfas">
            ✅ NSFAS
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {property.propertyName}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {property.city} · {property.universityNearby}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-primary-600 font-bold">
            {formatPrice(property.price)}
            <span className="text-xs font-normal text-gray-400">/mo</span>
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {property.roomType}
          </span>
        </div>
        {property.distanceFromCampus != null && (
          <p className="text-xs text-gray-400 mt-1">
            📍 {property.distanceFromCampus} km from campus
          </p>
        )}
      </div>
    </Link>
  );
}
