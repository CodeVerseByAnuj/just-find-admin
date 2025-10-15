"use client";

import React from "react";
import { Button, Label, TextInput } from "flowbite-react";
import OutlineCard from "../../shared/OutlineCard";
import { changeStudentPassword } from "@/app/router/studentProfile.router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema , PasswordForm} from "@/lib/schemas/studentProfile.schema";


function StudentPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
    setError,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    try {
      await changeStudentPassword({ password: data.password });
      reset();
    } catch (e) {
      setError("password", {
        type: "manual",
        message: "Failed to change password",
      });
    }
  };

  return (
    <div className="md:col-span-12 col-span-12">
      <OutlineCard>
        <h5 className="card-title">Change Password</h5>
        <p className="card-subtitle -mt-1">
          To change your password please confirm here
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-3 mt-3">
            {/* New Password */}
            <div className="md:col-span-6 col-span-12">
              <div className="mb-2 block">
                <Label htmlFor="password">New Password</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                sizing="md"
                {...register("password")}
              />
              {isSubmitted && errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-6 col-span-12">
              <div className="mb-2 block">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
              </div>
              <TextInput
                id="confirmPassword"
                type="password"
                sizing="md"
                {...register("confirmPassword")}
              />
              {isSubmitted && errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Button color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </OutlineCard>
    </div>
  );
}

export default StudentPassword;
