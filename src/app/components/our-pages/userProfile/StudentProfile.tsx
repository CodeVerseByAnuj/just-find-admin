"use client";
import React from "react";
import OutlineCard from "@/app/components/shared/OutlineCard";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { getStudentProfile, updateStudentProfile } from "@/app/router/studentProfile.router";
import StudentPassword from "./StudentPassword";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

const StudentProfile = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const { data: studentProfile, isLoading, refetch } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  React.useEffect(() => {
    if (studentProfile) {
      setValue("first_name", studentProfile.first_name || "");
      setValue("middle_name", studentProfile?.middle_name || "");
      setValue("last_name", studentProfile.last_name || "");
      setValue("dob", studentProfile.dob || "");
      setValue("phone", studentProfile.phone || "");
      setValue("gender", studentProfile.gender || "");
    }
  }, [studentProfile, setValue]);

  const onSubmit = async (data: any) => {
    // grab whatever's already stored
    const existing = JSON.parse(localStorage.getItem("user_details") || "{}");

    // update only the fields you have
    const updated = {
      ...existing,
      first_name: data.first_name,
      last_name: data.last_name,
    };

    // put it back
    localStorage.setItem("user_details", JSON.stringify(updated));

    window.dispatchEvent(new Event("user_details_changed"));

    // Only send editable fields
    const updateData = {
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      dob: data.dob,
      phone: data.phone,
      gender: data.gender,
    };

    await updateStudentProfile(updateData);
    refetch();
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <OutlineCard>
            <h5 className="card-title">Personal Details</h5>
            <p className="card-subtitle -mt-1">
              To change your personal detail , edit and save from here
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-12 mt-3 gap-6">
                {/* Department Name (disabled) */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="department">Department</Label>
                  </div>
                  <TextInput
                    id="department"
                    type="text"
                    sizing="md"
                    className="form-control"
                    value={studentProfile?.department?.name || ""}
                    disabled
                  />
                </div>

                {/* Roll Number (disabled) */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="roll_number">Roll No.</Label>
                  </div>
                  <TextInput
                    id="roll_number"
                    type="text"
                    sizing="md"
                    className="form-control"
                    value={studentProfile?.roll_number || ""}
                    disabled
                  />
                </div>

                {/* Enrollment ID (disabled) */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="enrollment_id">Enrollment ID</Label>
                  </div>
                  <TextInput
                    id="enrollment_id"
                    type="text"
                    sizing="md"
                    className="form-control"
                    value={studentProfile?.enrollment_id || ""}
                    disabled
                  />
                </div>

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
                    value={studentProfile?.email || ""}
                    disabled
                  />
                </div>

                {/* Entry Year (disabled) */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="entry_year">Entry Year</Label>
                  </div>
                  <TextInput
                    id="entry_year"
                    type="text"
                    sizing="md"
                    className="form-control"
                    value={studentProfile?.entry_year || ""}
                    disabled
                  />
                </div>

                {/* First Name */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="first_name">First Name <span className="text-red-600">*</span></Label>
                  </div>
                  <TextInput
                    id="first_name"
                    type="text"
                    sizing="md"
                    placeholder="First Name"
                    className="form-control"
                    {...register("first_name", {
                      required: "First name is required",
                      minLength: { value: 2, message: "First name must be at least 2 characters" },
                      maxLength: { value: 50, message: "First name must be at most 50 characters" },
                    })}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.first_name.message as string}</p>
                  )}
                </div>

                {/* Middle Name (optional) */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="middle_name">Middle Name</Label>
                  </div>
                  <TextInput
                    id="middle_name"
                    type="text"
                    sizing="md"
                    placeholder="Middle Name"
                    className="form-control"
                    {...register("middle_name", {
                      minLength: { value: 1, message: "Middle name must be at least 1 character" },
                      maxLength: { value: 50, message: "Middle name must be at most 50 characters" },
                    })}
                  />
                  {errors.middle_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.middle_name.message as string}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="last_name">Last Name <span className="text-red-600">*</span></Label>
                  </div>
                  <TextInput
                    id="last_name"
                    type="text"
                    sizing="md"
                    placeholder="Last Name"
                    className="form-control"
                    {...register("last_name", {
                      required: "Last name is required",
                      minLength: { value: 2, message: "Last name must be at least 2 characters" },
                      maxLength: { value: 50, message: "Last name must be at most 50 characters" },
                    })}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.last_name.message as string}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="dob">Date of Birth <span className="text-red-600">*</span></Label>
                  </div>
                  <TextInput
                    id="dob"
                    type="date"
                    sizing="md"
                    className="form-control"
                    {...register("dob", {
                      required: "Date of birth is required",
                      validate: (v) => {
                        if (!v) return "Date of birth is required";
                        const t = Date.parse(v);
                        return !isNaN(t) || "Invalid date";
                      },
                    })}
                  />
                  {errors.dob && <p className="text-sm text-red-600 mt-1">{errors.dob.message as string}</p>}
                </div>

                {/* Phone */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="phone">Phone <span className="text-red-600">*</span></Label>
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
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message as string}</p>}
                </div>

                {/* Gender */}
                <div className="md:col-span-4 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="gender">Gender <span className="text-red-600">*</span></Label>
                  </div>
                  <Select
                    id="gender"
                    className="select-md"
                    {...register("gender", { required: "Gender is required" })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender.message as string}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5">
                <Button color={"primary"} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </OutlineCard>
        </div>
        <StudentPassword />
      </div>
    </>
  );
};

export default StudentProfile;
