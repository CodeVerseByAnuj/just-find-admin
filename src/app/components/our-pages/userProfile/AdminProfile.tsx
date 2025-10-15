"use client";
import React from "react";
import OutlineCard from "@/app/components/shared/OutlineCard";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { getAdminProfile, updateAdminProfile } from "@/app/router/adminProfile.router";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import AdminPassword from "./AdminPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateAdminProfileSchema,
  UpdateAdminProfile,
} from "@/lib/schemas/adminProfile.schema";

const AdminProfile = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState,
    reset,
    formState: { errors },
  } = useForm<UpdateAdminProfile>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      dob: "",
      phone: "",
      gender: undefined,
    },
  });

  const { data: adminProfile, isLoading, refetch } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });

  React.useEffect(() => {
    if (adminProfile) {
      // reset will populate the form and clear errors
      reset({
        first_name: adminProfile.first_name || "",
        last_name: adminProfile.last_name || "",
        dob: adminProfile.dob || "",
        phone: adminProfile.phone || "",
        gender: adminProfile.gender || "",
      });
    }
  }, [adminProfile, reset]);

  const onSubmit = async (data: UpdateAdminProfile) => {
    try {
      // Merge with existing localStorage user_details but only update fields we actually have values for
      const existing = JSON.parse(localStorage.getItem("user_details") || "{}");

      const updatedLocal = {
        ...existing,
        ...(data.first_name ? { first_name: data.first_name } : {}),
        ...(data.last_name ? { last_name: data.last_name } : {}),
      };

      localStorage.setItem("user_details", JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event("user_details_changed"));

      // Prepare payload: include only provided fields (zod schema makes them optional)
      const updateData: UpdateAdminProfile = {};
      if (data.first_name !== undefined) updateData.first_name = data.first_name;
      if (data.last_name !== undefined) updateData.last_name = data.last_name;
      if (data.dob !== undefined) updateData.dob = data.dob;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.gender !== undefined) updateData.gender = data.gender;

      await updateAdminProfile(updateData);
      await refetch();
    } catch (err) {
      // Minimal but useful feedback — you can replace with toast or modal
      // eslint-disable-next-line no-console
      console.error("Failed to update admin profile:", err);
      alert("Could not update profile. Check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12">
        <OutlineCard>
          <h5 className="card-title">Personal Details</h5>
          <p className="card-subtitle -mt-1">
            To change your personal details, edit and save from here
          </p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-12 mt-3 gap-6">
              {/* Email (disabled) */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="email">Email</Label>
                </div>
                <TextInput
                  id="email"
                  type="email"
                  sizing="md"
                  className="form-control"
                  value={adminProfile?.email || ""}
                  disabled
                />
              </div>

              {/* First Name */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="first_name">First Name</Label>
                </div>
                <TextInput
                  id="first_name"
                  type="text"
                  sizing="md"
                  placeholder="First Name"
                  className="form-control"
                  {...register("first_name")}
                  aria-invalid={errors.first_name ? "true" : "false"}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="last_name">Last Name</Label>
                </div>
                <TextInput
                  id="last_name"
                  type="text"
                  sizing="md"
                  placeholder="Last Name"
                  className="form-control"
                  {...register("last_name")}
                  aria-invalid={errors.last_name ? "true" : "false"}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="dob">Date of Birth</Label>
                </div>
                <TextInput
                  id="dob"
                  type="date"
                  sizing="md"
                  className="form-control"
                  {...register("dob")}
                  aria-invalid={errors.dob ? "true" : "false"}
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="phone">Phone</Label>
                </div>
                <TextInput
                  id="phone"
                  type="text"
                  sizing="md"
                  placeholder="7080708090"
                  maxLength={10}
                  className="form-control"
                  {...register("phone", {
                      required: "Phone is required",
                      minLength: { value: 10, message: "Phone must be at least 10 digits" },
                      pattern: {
                        value: /^\+?\d{10}$/,
                        message: "Phone must be 10",
                      },
                  })}
                  aria-invalid={errors.phone ? "true" : "false"}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="md:col-span-4 col-span-12">
                <div className="mb-2 block">
                  <Label htmlFor="gender">Gender</Label>
                </div>
                <Select id="gender" className="select-md" {...register("gender")}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5">
              <Button color={"primary"} type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </OutlineCard>
      </div>

      <AdminPassword />
    </div>
  );
};

export default AdminProfile;
