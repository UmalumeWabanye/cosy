'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Array<{
    _id: string;
    title?: string;
    name?: string;
    lat?: number;
    lng?: number;
    location?: { lat?: number; lng?: number; city?: string };
    city?: string;
    price?: number;
    pricing?: { minRent?: number };
  }>;
  hoveredId?: string | null;
}

// City centre coordinates for fallback
const CITY_COORDS: Record<string, [number, number]> = {
  'Cape Town': [-33.9249, 18.4241],
  'Johannesburg': [-26.2041, 28.0473],
  'Pretoria': [-25.7479, 28.2293],
  'Durban': [-29.8587, 31.0218],
  'Stellenbosch': [-33.9321, 18.8602],
  'Grahamstown': [-33.3042, 26.5328],
  'Port Elizabeth': [-33.9608, 25.6022],
  'Bloemfontein': [-29.0852, 26.1596],
};

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    }
  }, [coords, map]);
  return null;
}

export default function PropertyMap({ properties, hoveredId }: PropertyMapProps) {
  const getCoords = (p: PropertyMapProps['properties'][0]): [number, number] | null => {
    const lat = p.lat ?? p.location?.lat;
    const lng = p.lng ?? p.location?.lng;
    if (lat && lng) return [lat, lng];
    const city = p.city ?? p.location?.city ?? '';
    return CITY_COORDS[city] ?? null;
  };

  const getPrice = (p: PropertyMapProps['properties'][0]) => {
    if (p.price) return `R${p.price.toLocaleString()}`;
    if (p.pricing?.minRent) return `R${p.pricing.minRent.toLocaleString()}+`;
    return 'POA';
  };

  const getTitle = (p: PropertyMapProps['properties'][0]) => p.title ?? p.name ?? 'Accommodation';

  const markers = properties
    .map((p) => ({ prop: p, coords: getCoords(p) }))
    .filter((x): x is { prop: typeof x.prop; coords: [number, number] } => x.coords !== null);

  const allCoords = markers.map((m) => m.coords);
  const centre: [number, number] = allCoords.length > 0
    ? [allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length, allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length]
    : [-29.0, 25.0]; // South Africa

  const makePriceIcon = (price: string, hovered: boolean) =>
    L.divIcon({
      className: '',
      html: `<div style="
        background:${hovered ? '#1565c0' : 'white'};
        color:${hovered ? 'white' : '#1565c0'};
        border:2px solid ${hovered ? '#1565c0' : '#1976d2'};
        border-radius:20px;
        padding:4px 10px;
        font-size:12px;
        font-weight:700;
        font-family:Inter,sans-serif;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.18);
        transition:all 0.15s;
        transform:${hovered ? 'scale(1.1)' : 'scale(1)'};
      ">${price}</div>`,
      iconAnchor: [30, 16],
    });

  return (
    <MapContainer
      center={centre}
      zoom={10}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {allCoords.length > 1 && <FitBounds coords={allCoords} />}
      {markers.map(({ prop, coords }) => (
        <Marker
          key={prop._id}
          position={coords}
          icon={makePriceIcon(getPrice(prop), hoveredId === prop._id)}
        >
          <Popup>
            <strong style={{ fontFamily: 'Inter,sans-serif', fontSize: 13 }}>{getTitle(prop)}</strong>
            <br />
            <span style={{ color: '#1976d2', fontWeight: 700 }}>{getPrice(prop)}/mo</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
