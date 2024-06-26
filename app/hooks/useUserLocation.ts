"use client";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { generalStore } from "../stores/generalStore";

function useUserLocation() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { enqueueSnackbar } = useSnackbar();
  const { actions } = generalStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          actions.setLocationData([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          setError(`Konum bilgisi alınırken hata oluştu: ${error.message}`);
          setLoading(false);
          enqueueSnackbar("Konum bilgisi alınamadı!", { variant: "error" });
          console.error(`Konum bilgisi alınırken hata oluştun: ${error.message}`);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: Infinity }
      );
    } else {
      setError("Konum bilgisi bu tarayıcıda kullanılamamaktadır!");
      setLoading(false);
      enqueueSnackbar("Konum bilgisi bu tarayıcıda kullanılamamaktadır!", { variant: "error" });
    }
  }, []);

  return { location, error, loading };
}

export default useUserLocation;
