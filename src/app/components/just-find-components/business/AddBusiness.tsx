"use client"

import { useState } from "react"
import TitleCard from "../../shared/TitleBorderCard"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { BusinessFormSchema } from "@/lib/schemas/business.schema"
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Checkbox,
  Select
} from "flowbite-react"
import { createBusiness } from "@/app/router/business.router"
import useCategory from "@/hooks/useCategory"
import { State, City } from "country-state-city";


type BusinessFormData = z.infer<typeof BusinessFormSchema>

function AddBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedState, setSelectedState] = useState("")
  const [availableCities, setAvailableCities] = useState<any[]>([])
  const { categories } = useCategory()

  const states = State.getStatesOfCountry("IN");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(BusinessFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: undefined,
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      website: "",
      rating: undefined,
      verified: false,
      images: "",
      open_time: "",
      close_time: "",
      tags: "",
      views_count: 0,
      is_premium: false,
      sponsored: false,
      seo_title: "",
      seo_description: "",
      slug: "",
      ogImage: "",
    },
  })

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateValue = e.target.value
    setSelectedState(stateValue)
    
    // Find the state code for the selected state
    const selectedStateObj = states.find(state => state.name === stateValue)
    
    if (selectedStateObj) {
      // Get cities for the selected state
      const cities = City.getCitiesOfState("IN", selectedStateObj.isoCode)
      setAvailableCities(cities)
    } else {
      setAvailableCities([])
    }
    
    // Clear the city selection when state changes
    setValue("city", "")
  }

  const onSubmit = async (data: BusinessFormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const imagesArray = data.images
      ? data.images.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
      : []

    const tagsArray = data.tags
      ? data.tags.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const payload = { ...data, images: imagesArray, tags: tagsArray }

    try {
      await createBusiness(payload as any)
      reset()
      setSelectedState("")
      setAvailableCities([])
      // Optionally navigate or show a success UI here
    } catch (error) {
      console.error("Failed to create business", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TitleCard title="Add Business">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">Name *</Label>
          <TextInput id="name" {...register("name")} disabled={isSubmitting} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="mb-2 block">Description</Label>
          <Textarea id="description" {...register("description")} rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category_id" className="mb-2 block">Category ID</Label>
            <Select id="category_id" {...register("category_id")}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="rating" className="mb-2 block">Rating</Label>
            <TextInput id="rating" type="number" step="0.1" {...register("rating")} />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="mb-2 block">Address</Label>
          <TextInput id="address" {...register("address")} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="state" className="mb-2 block">State</Label>
            <Select 
              id="state" 
              {...register("state")} 
              onChange={handleStateChange}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="city" className="mb-2 block">City</Label>
            <Select id="city" {...register("city")} disabled={!selectedState}>
              <option value="">Select City</option>
              {availableCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pincode" className="mb-2 block">Pincode</Label>
            <TextInput id="pincode" {...register("pincode")} />
          </div>
        </div>

        {/* ...existing code... */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="phone" className="mb-2 block">Phone</Label>
            <TextInput id="phone" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="email" className="mb-2 block">Email</Label>
            <TextInput id="email" type="email" {...register("email")} />
          </div>
          <div>
            <Label htmlFor="website" className="mb-2 block">Website</Label>
            <TextInput id="website" {...register("website")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="open_time" className="mb-2 block">Open Time</Label>
            <TextInput id="open_time" type="time" {...register("open_time")} />
          </div>
          <div>
            <Label htmlFor="close_time" className="mb-2 block">Close Time</Label>
            <TextInput id="close_time" type="time" {...register("close_time")} />
          </div>
        </div>

        <div>
          <Label htmlFor="images" className="mb-2 block">Images (comma or newline separated URLs)</Label>
          <Textarea id="images" {...register("images")} rows={3} />
        </div>

        <div>
          <Label htmlFor="tags" className="mb-2 block">Tags (comma separated)</Label>
          <TextInput id="tags" {...register("tags")} />
        </div>

        <div className="flex gap-4">
          <div>
            <Checkbox id="verified" {...register("verified")} />
            <Label htmlFor="verified" className="ml-2">Verified</Label>
          </div>
          <div>
            <Checkbox id="is_premium" {...register("is_premium")} />
            <Label htmlFor="is_premium" className="ml-2">Is Premium</Label>
          </div>
          <div>
            <Checkbox id="sponsored" {...register("sponsored")} />
            <Label htmlFor="sponsored" className="ml-2">Sponsored</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="seo_title" className="mb-2 block">SEO Title</Label>
          <TextInput id="seo_title" {...register("seo_title")} />
        </div>

        <div>
          <Label htmlFor="seo_description" className="mb-2 block">SEO Description</Label>
          <Textarea id="seo_description" {...register("seo_description")} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slug" className="mb-2 block">Slug</Label>
            <TextInput id="slug" {...register("slug")} />
          </div>
          <div>
            <Label htmlFor="ogImage" className="mb-2 block">OG Image URL</Label>
            <TextInput id="ogImage" {...register("ogImage")} />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" color="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Business"}
          </Button>
        </div>
      </form>
    </TitleCard>
  )
}

export default AddBusiness