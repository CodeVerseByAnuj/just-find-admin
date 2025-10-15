"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormData } from "@/lib/schemas/auth.schema";
import { loginUser } from "@/app/router/auth.router";
import { Eye, EyeOff } from "lucide-react"; // 👀 icons
import Link from "next/link";

const AuthLogin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });


  const onSubmit = async (data: LoginFormData) => {
    const response = await loginUser({
      email: data.email,
      password: data.password,
    });
    if (response) {
      localStorage.setItem("user_details", JSON.stringify(response));
      router.push("/");
    }
  };

  return (
    <>
      {/* Role Toggle */}
      {/* <section className="flex justify-between mt-4 gap-2 border-2 border-primary/15 rounded-md overflow-hidden">
        <button
          type="button"
            onClick={() => {
              setValue("user_role", 1);
              setValue("email", "");
              setValue("password", "");
            }}
          className={`px-4 flex-1 py-3 rounded-sm 
            ${role === 1 ? "bg-primary text-white" : " text-gray-700"}`}
        >
          Admin
        </button>

        <button
          type="button"
            onClick={() => {
              setValue("user_role", 2);
              setValue("email", "");
              setValue("password", "");
            }}
          className={`px-4 flex-1 py-3 rounded-sm 
            ${role === 2 ? "bg-primary text-white" : " text-gray-700"}`}
        >
          Professor
        </button>

        <button
          type="button"
            onClick={() => {
              setValue("user_role", 3);
              setValue("email", "");
              setValue("password", "");
            }}
          className={`px-4 flex-1 py-3 rounded-md 
            ${role === 3 ? "bg-primary text-white" : " text-gray-700"}`}
        >
          Student
        </button>
      </section> */}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        {/* Email */}
        <div className="mb-4">
          <Label htmlFor="email" className="mb-2 inline-block">
            Email
          </Label>
          <TextInput
            id="email"
            type="text"
            sizing="md"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <Label htmlFor="password" className="mb-2 inline-block">
            Password
          </Label>
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            placeholder="Enter your password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="flex justify-end -mt-2 mb-4">
          <a href={`/auth/auth1/forgot-password`} className="text-gray-500 hover:text-gray-700">Forgot Password</a>
        </div>
        {/* <Button type="submit" color="primary" className="rounded-md w-full">
          Sign in
        </Button> */}
        <button type="submit" className="rounded-md w-full hover:bg-white hover:text-black bg-black text-white border border-black px-5 py-2">
          Sign in
        </button>
      </form>

      <div className="absolute bottom-2 right-4 text-sm text-gray-500 flex gap-1">
        Powered by <span className="font-bold text-gray-700 hover:text-gray-400 transition duration-150"><Link target="_blank" href="https://infutrix.com/" className="flex gap-1">
          <svg width="18" height="19" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.4853 6.5662C11.1447 7.08844 11.6222 7.74387 11.7547 8.60489C11.772 8.78963 11.785 8.97465 11.7979 9.15976C11.86 10.0234 12.0021 10.9927 12.6771 11.5959C13.2706 12.0587 13.9614 12.1284 14.6834 12.1122C15.4517 12.1103 16.1827 12.4072 16.7311 12.9632C16.7631 12.9977 16.7951 13.0321 16.828 13.0676C16.8717 13.1112 16.8717 13.1112 16.9163 13.1557C17.4192 13.6905 17.6398 14.442 17.6323 15.1714C17.6317 15.2428 17.6317 15.2428 17.6312 15.3157C17.6133 16.1492 17.3054 16.8006 16.7358 17.388C16.703 17.4223 16.6701 17.4566 16.6363 17.492C16.1102 18.0091 15.4014 18.2429 14.6834 18.2663C13.8074 18.2378 13.0482 17.8778 12.4364 17.2326C11.8588 16.5442 11.6932 15.7326 11.7074 14.8485C11.7167 14.181 11.5881 13.4953 11.1585 12.9725C10.9781 12.7938 10.7754 12.6666 10.5555 12.5454C10.5211 12.5264 10.4867 12.5073 10.4512 12.4877C9.49985 12.0348 8.15761 12.1114 7.1903 12.4417C6.69114 12.6421 6.32832 12.9629 6.08754 13.4593C5.88819 13.9691 5.89051 14.4877 5.90594 15.029C5.91281 15.5633 5.88708 15.998 5.66668 16.4859C5.64433 16.536 5.62197 16.5862 5.59894 16.6378C5.20786 17.4084 4.54114 17.8916 3.75175 18.1502C2.97422 18.3676 2.16556 18.2438 1.46082 17.851C0.775486 17.4105 0.27275 16.7686 0.0813323 15.954C-0.105989 15.0512 0.0287689 14.2318 0.501107 13.4474C0.935477 12.7845 1.59049 12.344 2.34596 12.1656C2.57724 12.1229 2.80276 12.1122 3.03692 12.1068C3.79894 12.0873 4.56437 11.9992 5.1507 11.4416C5.65774 10.8697 5.79949 10.1567 5.82522 9.40604C5.86818 8.39296 6.10071 7.53409 6.83539 6.81433C7.83949 5.92644 9.38304 5.77742 10.4853 6.5662Z" fill="black" />
            <path d="M22.2375 6.59468C22.8186 7.01876 23.2754 7.64901 23.4244 8.37498C23.4729 8.69299 23.4984 9.01397 23.5256 9.3345C23.5964 10.1472 23.7622 10.9881 24.3584 11.5767C24.9486 12.0745 25.6635 12.1382 26.3993 12.1197C27.1676 12.1177 27.8986 12.4147 28.447 12.9707C28.479 13.0052 28.5109 13.0396 28.5439 13.0751C28.573 13.1042 28.6022 13.1333 28.6322 13.1632C29.135 13.698 29.3557 14.4494 29.3481 15.1789C29.3476 15.2503 29.3476 15.2503 29.3471 15.3231C29.3298 16.1264 29.0298 16.8077 28.4978 17.3954C27.9232 17.9559 27.186 18.2481 26.3993 18.2737C25.5233 18.2452 24.7641 17.8853 24.1523 17.24C23.7221 16.7273 23.477 16.0837 23.4417 15.4103C23.4399 15.3772 23.438 15.344 23.4361 15.3098C23.4266 15.1261 23.4248 14.9444 23.4302 14.7605C23.434 14.1094 23.2556 13.5539 22.9085 13.0128C22.2362 12.3516 21.3654 12.2322 20.4756 12.1968C19.6343 12.1603 18.8984 11.8436 18.3209 11.2029C17.7618 10.5329 17.5182 9.73017 17.5796 8.85088C17.662 7.95907 18.0593 7.27232 18.7078 6.69626C19.7347 5.88359 21.1712 5.85547 22.2375 6.59468Z" fill="black" />
            <path d="M16.5881 0.686555C17.0009 1.04842 17.2928 1.4884 17.4817 2.00995C17.4963 2.04692 17.511 2.08388 17.5262 2.12196C17.7785 2.87381 17.6543 3.77246 17.3433 4.47871C16.9752 5.19997 16.3482 5.75225 15.5907 5.99794C14.7352 6.23344 13.9092 6.16581 13.1292 5.70177C12.9141 5.55343 12.7298 5.37839 12.5467 5.19085C12.5178 5.16276 12.4889 5.13467 12.4591 5.10573C11.9496 4.56815 11.7344 3.81206 11.6992 3.07816C11.7385 2.15864 12.0708 1.38675 12.711 0.739966C13.8373 -0.251735 15.4336 -0.223688 16.5881 0.686555Z" fill="#FF6300" />
            <path d="M22.3047 18.7607C22.9433 19.2545 23.3144 19.9184 23.477 20.7178C23.4967 20.8954 23.5012 21.0703 23.5 21.249C23.4998 21.2963 23.4996 21.3436 23.4993 21.3924C23.48 22.246 23.1415 22.9216 22.5546 23.5189C21.9423 24.1012 21.2116 24.3251 20.3869 24.326C19.5644 24.2724 18.8571 23.893 18.2919 23.2854C17.7666 22.6645 17.5404 21.8644 17.5735 21.0502C17.6462 20.243 17.9621 19.4974 18.5454 18.9397C19.6577 18.02 21.1237 17.9239 22.3047 18.7607Z" fill="#FF6300" />
            <path d="M10.717 18.8701C11.1299 19.232 11.4217 19.672 11.6106 20.1935C11.6253 20.2305 11.6399 20.2675 11.6551 20.3056C11.9004 21.0363 11.7957 21.9376 11.4837 22.6237C11.3511 22.882 11.1975 23.1073 11.011 23.327C10.9875 23.3556 10.964 23.3843 10.9398 23.4138C10.424 23.9959 9.68239 24.2709 8.93554 24.324C8.10575 24.3319 7.3831 24.0738 6.78046 23.4818C6.74585 23.4464 6.71125 23.411 6.6756 23.3744C6.64671 23.3464 6.61781 23.3183 6.58804 23.2893C6.07849 22.7517 5.8633 21.9957 5.82812 21.2618C5.86741 20.3422 6.19973 19.5703 6.83991 18.9236C7.96621 17.9319 9.56247 17.9599 10.717 18.8701Z" fill="#FF6300" />
            <path d="M14.6782 24.2542C14.7245 24.2546 14.7708 24.2549 14.8185 24.2552C15.1801 24.2632 15.4804 24.3138 15.8139 24.4649C15.8752 24.4915 15.8752 24.4915 15.9377 24.5187C16.6062 24.835 17.1697 25.4244 17.4382 26.1323C17.664 26.8105 17.7566 27.6829 17.4743 28.3579C17.4626 28.3864 17.4509 28.4149 17.4389 28.4442C17.1052 29.2418 16.5949 29.8164 15.8054 30.1589C15.0104 30.4688 14.1793 30.4404 13.4006 30.0938C12.686 29.7316 12.1672 29.1396 11.8734 28.3787C11.6077 27.5168 11.6693 26.6624 12.048 25.851C12.4535 25.1045 13.094 24.5849 13.8831 24.341C14.1504 24.2681 14.4025 24.2512 14.6782 24.2542Z" fill="#FF6300" />
          </svg>
          Infutrix</Link></span>
      </div>
    </>
  );
};

export default AuthLogin;
