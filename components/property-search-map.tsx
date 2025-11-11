"use client"

import { useCallback, useEffect, useState } from "react"
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Maximize, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface Property {
  id: string
  title: string
  description: string | null
  property_type: string
  listing_type: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  address: string
  city: string
  state: string | null
  country: string
  latitude: number
  longitude: number
  status: string
}

interface PropertySearchMapProps {
  properties: Property[]
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 0,
  lng: 0,
}

export function PropertySearchMap({ properties }: PropertySearchMapProps) {
  const t = useTranslations("properties")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Fit map bounds to show all properties
  useEffect(() => {
    if (map && properties.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend({ lat: property.latitude, lng: property.longitude })
        }
      })
      map.fitBounds(bounds)
    }
  }, [map, properties])

  // Fit map bounds to show all properties
  useEffect(() => {
    if (map && properties.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend({ lat: property.latitude, lng: property.longitude })
        }
      })
      map.fitBounds(bounds)
    }
  }, [map, properties])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full border border-border rounded-lg">
        <p className="text-destructive">Error loading Google Maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full border border-border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={2}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null

          return (
            <Marker
              key={property.id}
              position={{ lat: property.latitude, lng: property.longitude }}
              onClick={() => setSelectedProperty(property)}
              onMouseOver={() => setHoveredProperty(property)}
              onMouseOut={() => setHoveredProperty(null)}
            />
          )
        })}

        {hoveredProperty && (
          <InfoWindow
            position={{ lat: hoveredProperty.latitude, lng: hoveredProperty.longitude }}
            onCloseClick={() => setHoveredProperty(null)}
          >
            <div style={{ minWidth: "200px" }}>
              <strong>{hoveredProperty.title}</strong>
              <br />
              <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                ${hoveredProperty.price.toLocaleString()}
              </span>
              <br />
              <small>
                {hoveredProperty.city}, {hoveredProperty.country}
              </small>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-[1000]">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-lg line-clamp-1">{selectedProperty.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProperty.city}, {selectedProperty.country}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedProperty(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm">
                {selectedProperty.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.bedrooms}</span>
                  </div>
                )}
                {selectedProperty.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.bathrooms}</span>
                  </div>
                )}
                {selectedProperty.area_sqft && (
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.area_sqft} sqft</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">${selectedProperty.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProperty.listing_type === "rent"
                      ? t("perMonth")
                      : t(`listingTypes.${selectedProperty.listing_type}`)}
                  </p>
                </div>
                <Link href={`/browse/${selectedProperty.id}`}>
                  <Button size="sm">{t("viewDetails")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
