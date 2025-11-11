"use client"

import { useCallback, useRef, useState } from "react"
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const defaultCenter = {
  lat: 0,
  lng: 0,
}

const libraries: ("places")[] = ["places"]

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
  initialAddress?: string
}

export function MapPicker({ onLocationSelect, initialLat, initialLng, initialAddress }: MapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.LatLng | null>(
    initialLat && initialLng ? new google.maps.LatLng(initialLat, initialLng) : null
  )
  const [address, setAddress] = useState(initialAddress || "")
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const center = initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const onMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarker(e.latLng)

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder()
      try {
        const result = await geocoder.geocode({ location: e.latLng })
        if (result.results[0]) {
          const formattedAddress = result.results[0].formatted_address
          setAddress(formattedAddress)
          onLocationSelect(lat, lng, formattedAddress)
        } else {
          const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setAddress(addr)
          onLocationSelect(lat, lng, addr)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setAddress(addr)
        onLocationSelect(lat, lng, addr)
      }
    },
    [onLocationSelect]
  )

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const newLocation = place.geometry.location

        setMarker(newLocation)
        setAddress(place.formatted_address || "")

        // Pan and zoom to the selected location
        if (map) {
          map.panTo(newLocation)
          map.setZoom(15)
        }

        onLocationSelect(lat, lng, place.formatted_address || "")
      }
    }
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] border border-border rounded-lg">
        <p className="text-destructive">Error loading Google Maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] border border-border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address-search">Search Address</Label>
        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
          <div className="flex gap-2">
            <Input
              id="address-search"
              placeholder="Start typing address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => autocompleteRef.current?.getPlace()}
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={initialLat && initialLng ? 13 : 2}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      {marker && (
        <p className="text-sm text-muted-foreground">
          Selected: {marker.lat().toFixed(6)}, {marker.lng().toFixed(6)}
        </p>
      )}
    </div>
  )
}
