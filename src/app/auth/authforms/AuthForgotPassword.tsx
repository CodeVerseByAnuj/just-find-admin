"use client";

import { Button, Label, TextInput } from "flowbite-react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
  studentForgotPasswordSchema,
  StudentForgotPasswordFormData,
} from "@/lib/schemas/auth.schema";
import { forgotPassword, studentForgotPassword } from "@/app/router/auth.router";

const AuthForgotPassword = () => {
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    typeof userRole extends "student"
      ? StudentForgotPasswordFormData
      : ForgotPasswordFormData
  >({
    resolver: zodResolver(
      userRole === "student" ? studentForgotPasswordSchema : forgotPasswordSchema
    ),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (
    data: ForgotPasswordFormData | StudentForgotPasswordFormData
  ) => {
    console.log("✅ Form submitted with:", data);
    if (userRole === "student") {
      await studentForgotPassword(data as StudentForgotPasswordFormData);
    } else {
      await forgotPassword(data as ForgotPasswordFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
      <div className="mb-4">
        <Label htmlFor="email" className="mb-2 block">
          Email
        </Label>
        <div suppressHydrationWarning>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            placeholder="Enter your email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div suppressHydrationWarning>
        <Button type="submit" className="rounded-md w-full bg-primary">
          Send
        </Button>
      </div>
    </form>
  );
};

export default AuthForgotPassword;
