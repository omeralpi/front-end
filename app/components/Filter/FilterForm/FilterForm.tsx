import { useResponsive } from "@/app/hooks/useResponsive";
import useUserLocation from "@/app/hooks/useUserLocation";
import { FilterFormSchema } from "@/app/schema/filterFormSchema";
import { generalStore } from "@/app/stores/generalStore";
import { Location } from "@/app/types";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import { useSnackbar } from "notistack";
import { FC } from "react";
import { useForm } from "react-hook-form";
import FormProvider from "../../Form/FormProvider/FormProvider";
import RangeInput from "../../Form/RangeInput/RangeInput";
import FilterButton from "../Buttons/FilterButton";
import FilteredCard from "../FilteredCard/FilteredCard";
import { useGetFilteredData } from "./actions";

import "./styles.scss";

type FilteredCardType = {
  handleClickToCenter: (location: Location) => void;
};

const FilterForm: FC<FilteredCardType> = ({ handleClickToCenter }) => {
  const mdUp = useResponsive("up", "md");
  const methods = useForm({
    resolver: yupResolver(FilterFormSchema),
    defaultValues: {
      distance: 10,
      size: 10
    }
  });
  const { actions } = generalStore();
  const { enqueueSnackbar } = useSnackbar();
  const { location } = useUserLocation();

  const { watch, handleSubmit } = methods;

  const values = watch();

  const filterData = useGetFilteredData();

  const onSubmit = handleSubmit(async (data) => {
    if (location && location?.[0] && location?.[1]) {
      try {
        filterData.mutate(
          {
            longitude: location?.[0] ?? 0,
            latitude: location?.[1] ?? 0,
            distance: data.distance,
            size: data.size
          },
          {
            onSuccess: (data) => {
              actions.setFilteredLocationData(data.data);
            },
            onError: (error) => {
              enqueueSnackbar("Konumlar filtrelenirken bir hata oluştu", { variant: "error" });
            }
          }
        );
      } catch (error) {
        enqueueSnackbar("Konumlar filtrelenirken bir hata oluştu", { variant: "error" });
      }
    } else {
      enqueueSnackbar("Filtreleme yapabilmek için konum erişimine izin vermeniz gerekmektedir!", {
        variant: "warning"
      });
    }
  });

  return (
    <div className={classNames("filter-section", { "filter-section-responsive": !mdUp })}>
      <FormProvider
        methods={methods}
        onSubmit={onSubmit}
        className={classNames("filter-section-form", {
          "filter-section-form-responsive": !mdUp
        })}>
        <h3>Filtrele</h3>
        <div>
          <span>Mesafe {`(${values.distance} km)`}</span>
          <RangeInput name="distance" min={1} max={20} />
        </div>
        <div>
          <span>Adet {`(${values.size})`}</span>
          <RangeInput name="size" min={1} max={30} />
        </div>
        <FilterButton classes="filter-button-contained" label="Ara" />
      </FormProvider>
      <FilteredCard handleClickToCenter={handleClickToCenter} />
    </div>
  );
};

export default FilterForm;
