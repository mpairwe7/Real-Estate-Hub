"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPicker } from "@/components/map-picker"
import { useToast } from "@/components/ui/toast"
import { propertySchema } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useTranslations } from "next-intl"

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const t = useTranslations("properties")
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    listingType: "rent",
    price: "",
    bedrooms: "",
    bathrooms: "",
    areaSqft: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
    status: "available",
  })

  useEffect(() => {
    async function fetchProperty() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .eq("owner_id", user.id)
        .single()

      if (error || !data) {
        addToast({
          title: "Error",
          description: "Property not found or you don't have permission to edit it",
          variant: "error",
        })
        router.push("/properties")
        return
      }

      setFormData({
        title: data.title,
        description: data.description || "",
        propertyType: data.property_type,
        listingType: data.listing_type,
        price: data.price.toString(),
        bedrooms: data.bedrooms?.toString() || "",
        bathrooms: data.bathrooms?.toString() || "",
        areaSqft: data.area_sqft?.toString() || "",
        address: data.address,
        city: data.city,
        state: data.state || "",
        country: data.country,
        postalCode: data.postal_code || "",
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
      })
      setIsFetching(false)
    }

    fetchProperty()
  }, [params.id])

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate form data
      const validatedData = propertySchema.parse({
        title: formData.title,
        description: formData.description || undefined,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        price: Number.parseFloat(formData.price),
        bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
        areaSqft: formData.areaSqft ? Number.parseFloat(formData.areaSqft) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        country: formData.country,
        postalCode: formData.postalCode || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      })

      const { error: updateError } = await supabase
        .from("properties")
        .update({
          title: validatedData.title,
          description: validatedData.description,
          property_type: validatedData.propertyType,
          listing_type: validatedData.listingType,
          price: validatedData.price,
          bedrooms: validatedData.bedrooms,
          bathrooms: validatedData.bathrooms,
          area_sqft: validatedData.areaSqft,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          postal_code: validatedData.postalCode,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      addToast({
        title: "Success!",
        description: "Property updated successfully",
        variant: "success",
      })

      router.push(`/properties/${params.id}`)
    } catch (err: any) {
      console.error("[v0] Error updating property:", err)

      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((error) => {
          newErrors[error.path[0] as string] = error.message
        })
        setErrors(newErrors)
      }

      addToast({
        title: "Error",
        description: err.message || "Failed to update property",
        variant: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/properties/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToProperty")}
            </Button>
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">{t("editProperty")}</CardTitle>
            <CardDescription>{t("editPropertyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">{t("propertyTitle")} *</Label>
                  <Input
                    id="title"
                    placeholder={t("propertyTitlePlaceholder")}
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">{t("propertyType")} *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">{t("types.apartment")}</SelectItem>
                      <SelectItem value="house">{t("types.house")}</SelectItem>
                      <SelectItem value="commercial">{t("types.commercial")}</SelectItem>
                      <SelectItem value="land">{t("types.land")}</SelectItem>
                      <SelectItem value="office">{t("types.office")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listingType">{t("listingType")} *</Label>
                  <Select
                    value={formData.listingType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, listingType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">{t("listingTypes.rent")}</SelectItem>
                      <SelectItem value="sale">{t("listingTypes.sale")}</SelectItem>
                      <SelectItem value="both">{t("listingTypes.both")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">{t("price")} *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1500"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("status.label")} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{t("status.available")}</SelectItem>
                      <SelectItem value="rented">{t("status.rented")}</SelectItem>
                      <SelectItem value="sold">{t("status.sold")}</SelectItem>
                      <SelectItem value="pending">{t("status.pending")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaSqft">{t("area")}</Label>
                  <Input
                    id="areaSqft"
                    type="number"
                    placeholder="1200"
                    value={formData.areaSqft}
                    onChange={(e) => setFormData((prev) => ({ ...prev, areaSqft: e.target.value }))}
                  />
                  {errors.areaSqft && <p className="text-sm text-destructive">{errors.areaSqft}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))}
                  />
                  {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
                  />
                  {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("city")} *</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{t("state")}</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">{t("country")} *</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  />
                  {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t("postalCode")}</Label>
                  <Input
                    id="postalCode"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("locationOnMap")} *</Label>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  initialAddress={formData.address}
                />
                {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? t("savingChanges") : t("saveChanges")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/properties/${params.id}`)}>
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
