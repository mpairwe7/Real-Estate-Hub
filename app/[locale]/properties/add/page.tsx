"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPicker } from "@/components/map-picker"
import { FormStepIndicator } from "@/components/form-step-indicator"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/components/ui/toast"
import { propertySchema } from "@/lib/validations"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

const STEPS = [
  { title: "Basic Info", description: "Property details" },
  { title: "Specifications", description: "Size & features" },
  { title: "Images", description: "Upload photos" },
  { title: "Location", description: "Address & map" },
  { title: "Review", description: "Confirm details" },
]

export default function AddPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
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
    images: [] as string[],
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
  })

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    try {
      if (step === 0) {
        // Basic Info validation
        propertySchema.pick({ title: true, propertyType: true, listingType: true, price: true }).parse({
          title: formData.title,
          propertyType: formData.propertyType,
          listingType: formData.listingType,
          price: formData.price ? Number.parseFloat(formData.price) : 0,
        })
      } else if (step === 1) {
        // Specifications validation
        const specs = {
          bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
          areaSqft: formData.areaSqft ? Number.parseFloat(formData.areaSqft) : null,
        }
        propertySchema.pick({ bedrooms: true, bathrooms: true, areaSqft: true }).parse(specs)
      } else if (step === 2) {
        // Images validation - at least one image required
        if (formData.images.length === 0) {
          newErrors.images = "Please upload at least one image"
          setErrors(newErrors)
          return false
        }
      } else if (step === 3) {
        // Location validation
        propertySchema.pick({ address: true, city: true, country: true, latitude: true, longitude: true }).parse({
          address: formData.address,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        if (formData.latitude === 0 && formData.longitude === 0) {
          newErrors.location = "Please select a location on the map"
        }
      }

      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    } else {
      addToast({
        title: "Validation Error",
        description: "Please fix the errors before continuing",
        variant: "error",
      })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    // Use Google Maps Geocoding API to parse address components
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const addressComponents = results[0].address_components
        
        // Parse address components
        let city = ""
        let state = ""
        let country = ""
        let postalCode = ""

        addressComponents.forEach((component) => {
          const types = component.types
          if (types.includes("locality")) {
            city = component.long_name
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name
          } else if (types.includes("country")) {
            country = component.long_name
          } else if (types.includes("postal_code")) {
            postalCode = component.long_name
          }
        })

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: address,
          city: city || prev.city,
          state: state || prev.state,
          country: country || prev.country,
          postalCode: postalCode || prev.postalCode,
        }))
      } else {
        // Fallback if geocoding fails
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: address,
        }))
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all steps
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3)) {
      addToast({
        title: "Validation Error",
        description: "Please complete all required fields correctly",
        variant: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate complete form data
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

      const { error: insertError } = await supabase.from("properties").insert({
        owner_id: user.id,
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
        status: "available",
      }).select()

      if (insertError) throw insertError

      // Get the inserted property ID
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (propertyError) throw propertyError

      // Insert images into property_images table
      if (formData.images.length > 0) {
        const imageInserts = formData.images.map((imageUrl, index) => ({
          property_id: propertyData.id,
          image_url: imageUrl,
          display_order: index,
        }))

        const { error: imagesError } = await supabase
          .from("property_images")
          .insert(imageInserts)

        if (imagesError) {
          console.error("Error inserting images:", imagesError)
          // Don't throw error here, property is created successfully
        }
      }

      addToast({
        title: "Success!",
        description: "Property added successfully",
        variant: "success",
      })

      router.push(`/${locale}/properties`)
    } catch (err: any) {
      console.error("[v0] Error adding property:", err)
      addToast({
        title: "Error",
        description: err.message || "Failed to add property",
        variant: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${locale}/properties`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Add New Property</CardTitle>
            <CardDescription>List your property for rent or sale</CardDescription>
          </CardHeader>
          <CardContent>
            <FormStepIndicator steps={STEPS} currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="Beautiful 3BR Apartment in Downtown"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listingType">Listing Type *</Label>
                      <Select
                        value={formData.listingType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, listingType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="1500"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>
                </div>
              )}

              {/* Step 1: Specifications */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="areaSqft">Area (sq ft)</Label>
                    <Input
                      id="areaSqft"
                      type="number"
                      placeholder="1200"
                      value={formData.areaSqft}
                      onChange={(e) => setFormData((prev) => ({ ...prev, areaSqft: e.target.value }))}
                    />
                    {errors.areaSqft && <p className="text-sm text-destructive">{errors.areaSqft}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
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
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="2"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
                      />
                      {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Images */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                    maxImages={6}
                    folder="properties"
                  />
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      />
                      {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="USA"
                        value={formData.country}
                        onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      />
                      {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="10001"
                        value={formData.postalCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location on Map *</Label>
                    <MapPicker
                      onLocationSelect={handleLocationSelect}
                      initialLat={formData.latitude}
                      initialLng={formData.longitude}
                      initialAddress={formData.address}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="rounded-lg border border-border p-6 space-y-4">
                    <h3 className="font-serif font-bold text-xl">Review Your Property</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium">{formData.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">${Number.parseFloat(formData.price || "0").toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium capitalize">{formData.propertyType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Listing Type</p>
                        <p className="font-medium capitalize">{formData.listingType}</p>
                      </div>
                      {formData.bedrooms && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-medium">{formData.bedrooms}</p>
                        </div>
                      )}
                      {formData.bathrooms && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-medium">{formData.bathrooms}</p>
                        </div>
                      )}
                      {formData.areaSqft && (
                        <div>
                          <p className="text-sm text-muted-foreground">Area</p>
                          <p className="font-medium">{formData.areaSqft} sq ft</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {formData.city}, {formData.country}
                        </p>
                      </div>
                    </div>

                    {formData.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm mt-1">{formData.description}</p>
                      </div>
                    )}

                    {formData.images.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Images ({formData.images.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.slice(0, 3).map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`Property ${idx + 1}`} 
                              className="w-full h-24 object-cover rounded-md"
                            />
                          ))}
                        </div>
                        {formData.images.length > 3 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            +{formData.images.length - 3} more images
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-border">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="ml-auto">
                    {isLoading ? "Adding Property..." : "Add Property"}
                  </Button>
                )}

                <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/properties`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
