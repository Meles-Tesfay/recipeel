"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Place {
    name: string;
    type: string;
    dist: string;
    lat: number;
    lng: number;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 14);
    }, [lat, lng, map]);
    return null;
}

export default function MapComponent({ places }: { places: Place[] }) {
    const center: [number, number] = places.length > 0
        ? [places[0].lat, places[0].lng]
        : [40.7128, -74.006];

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: "100%", width: "100%", borderRadius: "24px" }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={center[0]} lng={center[1]} />
            {places.map((place, i) => (
                <Marker key={i} position={[place.lat, place.lng]} icon={defaultIcon}>
                    <Popup>
                        <div className="font-bold text-sm">{place.name}</div>
                        <div className="text-xs text-gray-500">{place.type} · {place.dist}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
