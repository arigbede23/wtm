// LocationPicker — small Leaflet map for picking a location pin.
// Click on the map to place/move the marker. Returns { lat, lng } via callback.
// Must be dynamically imported with { ssr: false } since Leaflet needs the DOM.

"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon path (same fix as EventMap)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LocationPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
};

function ClickHandler({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  // Default center: provided coords or NYC
  const centerLat = lat ?? 40.7128;
  const centerLng = lng ?? -74.006;

  return (
    <div className="h-[200px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {lat != null && lng != null && (
          <Marker position={[lat, lng]} />
        )}
      </MapContainer>
    </div>
  );
}
