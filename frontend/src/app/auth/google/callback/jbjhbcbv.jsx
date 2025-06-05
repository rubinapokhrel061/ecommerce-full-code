"use client"; 

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const GoogleAuthCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
 

  const { data: userlogin, isLoading } = useGetProtectedQuery();

  const isAuthenticated = userlogin?.is_auth || false;
  const userRole = userlogin?.role || null;

  useEffect(() => {
   
    if (isAuthenticated && userRole ) {

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      alert("Authentication failed. Please try again.");
    }
  }, [searchParams, router]);

  return <div>Authenticating...</div>;
};

export default GoogleAuthCallback;
