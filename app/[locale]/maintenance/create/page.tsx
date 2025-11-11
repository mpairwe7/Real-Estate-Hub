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
import { FormStepIndicator } from "@/components/form-step-indicator"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/components/ui/toast"
import { maintenanceSchema } from "@/lib/validations"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useTranslations } from "next-intl"

const STEPS = [
  { title: "Details", description: "Request information" },
  { title: "Images", description: "Upload photos" },
  { title: "Review", description: "Confirm request" },
]

export default function CreateMaintenanceRequestPage() {
  const t = useTranslations("maintenance")
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [properties, setProperties] = useState<any[]>([])

  const [formData, setFormData] = useState({
    propertyId: "",
    title: "",
    description: "",
    category: "plumbing",
    priority: "medium",
    estimatedCost: "",
    images: [] as string[],
  })

  useEffect(() => {
    async function fetchProperties() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("properties").select("id, title, address, city").eq("owner_id", user.id)

      if (data) setProperties(data)
    }
    fetchProperties()
  }, [])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    try {
      if (step === 0) {
        // Details validation
        maintenanceSchema.parse({
          propertyId: formData.propertyId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          estimatedCost: formData.estimatedCost ? Number.parseFloat(formData.estimatedCost) : null,
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all steps
    if (!validateStep(0)) {
      addToast({
        title: "Validation Error",
        description: "Please complete all required fields correctly",
        variant: "error",
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const validatedData = maintenanceSchema.parse({
        propertyId: formData.propertyId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        estimatedCost: formData.estimatedCost ? Number.parseFloat(formData.estimatedCost) : null,
      })

      const { data: requestData, error: insertError } = await supabase.from("maintenance_requests").insert({
        property_id: validatedData.propertyId,
        requester_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        estimated_cost: validatedData.estimatedCost,
        status: "pending",
      }).select()

      if (insertError) throw insertError

      // Insert images if any
      if (formData.images.length > 0 && requestData && requestData[0]) {
        const imageUrls = formData.images.join(',')
        const { error: updateError } = await supabase
          .from("maintenance_requests")
          .update({ image_urls: imageUrls })
          .eq("id", requestData[0].id)

        if (updateError) {
          console.error("Error updating images:", updateError)
          // Don't throw error here, request is created successfully
        }
      }

      addToast({
        title: "Success!",
        description: "Maintenance request created successfully",
        variant: "success",
      })

      router.push("/maintenance")
    } catch (err: any) {
      console.error("[v0] Error creating maintenance request:", err)

      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((error) => {
          newErrors[error.path[0] as string] = error.message
        })
        setErrors(newErrors)
      }

      addToast({
        title: "Error",
        description: err.message || "Failed to create request",
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
          <Link href="/maintenance">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToMaintenance")}
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">{t("createRequest")}</CardTitle>
            <CardDescription>{t("createRequestDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormStepIndicator steps={STEPS} currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 0: Details */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-2">
                <Label htmlFor="property">{t("property")} *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProperty")} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">{t("requestTitle")} *</Label>
                <Input
                  id="title"
                  placeholder={t("requestTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")} *</Label>
                <Textarea
                  id="description"
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t("category")} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">{t("categories.plumbing")}</SelectItem>
                      <SelectItem value="electrical">{t("categories.electrical")}</SelectItem>
                      <SelectItem value="hvac">{t("categories.hvac")}</SelectItem>
                      <SelectItem value="carpentry">{t("categories.carpentry")}</SelectItem>
                      <SelectItem value="painting">{t("categories.painting")}</SelectItem>
                      <SelectItem value="cleaning">{t("categories.cleaning")}</SelectItem>
                      <SelectItem value="landscaping">{t("categories.landscaping")}</SelectItem>
                      <SelectItem value="other">{t("categories.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority.label")} *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("priority.low")}</SelectItem>
                      <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                      <SelectItem value="high">{t("priority.high")}</SelectItem>
                      <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">{t("estimatedCost")}</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="500"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimatedCost: e.target.value }))}
                />
                {errors.estimatedCost && <p className="text-sm text-destructive">{errors.estimatedCost}</p>}
              </div>
                </div>
              )}

              {/* Step 1: Images */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                    maxImages={4}
                    folder="maintenance"
                  />
                </div>
              )}

              {/* Step 2: Review */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="rounded-lg border border-border p-6 space-y-4">
                    <h3 className="font-serif font-bold text-xl">Review Maintenance Request</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Property</p>
                        <p className="font-medium">
                          {properties.find(p => p.id === formData.propertyId)?.title || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium capitalize">{formData.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <p className="font-medium capitalize">{formData.priority}</p>
                      </div>
                      {formData.estimatedCost && (
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium">${Number.parseFloat(formData.estimatedCost).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{formData.title}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{formData.description}</p>
                    </div>

                    {formData.images.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Images ({formData.images.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.slice(0, 3).map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`Maintenance ${idx + 1}`} 
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
                    {t("back")}
                  </Button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto gap-2">
                    {t("next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="ml-auto">
                    {isLoading ? t("creatingRequest") : t("createRequest")}
                  </Button>
                )}

                <Button type="button" variant="outline" onClick={() => router.push("/maintenance")}>
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
