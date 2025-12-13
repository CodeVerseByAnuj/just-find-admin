"use client"

import { useState } from "react"
import TitleCard from "../../shared/TitleBorderCard"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Checkbox,
} from "flowbite-react"
import { createBusiness } from "@/app/router/business.router"

const BusinessFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  category_id: z.preprocess((val) => Number(val), z.number().optional()),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  rating: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  verified: z.boolean().optional().default(false),
  images: z.string().optional(), // we'll parse to array from newline/comma-separated
  open_time: z.string().optional(),
  close_time: z.string().optional(),
  tags: z.string().optional(), // comma separated
  views_count: z.preprocess((v) => Number(v), z.number().optional()),
  is_premium: z.boolean().optional().default(false),
  sponsored: z.boolean().optional().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  slug: z.string().optional(),
  ogImage: z.string().optional(),
})

type BusinessFormData = z.infer<typeof BusinessFormSchema>

function AddBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
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

  const onSubmit = async (data: BusinessFormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    // Transform images and tags into arrays as expected by API
    const payload: any = { ...data }
    if (data.images && typeof data.images === "string") {
      const arr = data.images
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
      payload.images = arr
    }
    if (data.tags && typeof data.tags === "string") {
      payload.tags = data.tags
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    }

    try {
      await createBusiness(payload)
      reset()
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
            <TextInput id="category_id" {...register("category_id")} />
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
            <Label htmlFor="city" className="mb-2 block">City</Label>
            <TextInput id="city" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state" className="mb-2 block">State</Label>
            <TextInput id="state" {...register("state")} />
          </div>
          <div>
            <Label htmlFor="pincode" className="mb-2 block">Pincode</Label>
            <TextInput id="pincode" {...register("pincode")} />
          </div>
        </div>

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
