import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Car } from "../../components/car";
import Carousel, { Dots, slidesToShowPlugin } from "@brainhubeu/react-carousel";
import "@brainhubeu/react-carousel/lib/style.css";
import { useMediaQuery } from "react-responsive";
import { SCREENS } from "../../components/responsive";
import carsService from "../../services/carsService";
import { GetCars_cars } from "../../services/carsService/__generated__/GetCars";
import { Dispatch } from "redux";
import { setTopCars } from "./slice";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { makeSelectTopCars } from "./selectors";
import MoonLoader from "react-spinners/MoonLoader";

const TopCarsContainer = styled.div`
  ${tw`
        max-w-screen-lg
        w-full
        flex
        flex-col
        items-center
        justify-center
        pr-4
        pl-4
        md:pl-0
        md:pr-0
        mb-10
    `}
`;

const Title = styled.h2`
  ${tw`
        text-3xl
        lg:text-5xl
        text-black
        font-extrabold
    `}
`;

const CarsContainer = styled.div`
  ${tw`
        w-full
        flex
        flex-wrap
        justify-center
        mt-7
        md:mt-10
    `}
`;

const EmptyCars = styled.div`
  ${tw`
    w-full
    flex
    justify-center
    items-center
    text-sm
    text-gray-500
  `}
`;

const LoadingContainer = styled.div`
  ${tw`
    w-full
    flex
    justify-center
    items-center
    text-base
    text-black
    mt-10
  `}
`;

const actionDispatch = (dispatch: Dispatch) => ({
  setTopCars: (cars: GetCars_cars[]) => dispatch(setTopCars(cars)),
});

const stateSelector = createSelector(makeSelectTopCars, (topCars) => ({
  topCars,
}));

const wait = (timeout: number) => new Promise((rs) => setTimeout(rs, timeout));

export function TopCars() {
  const [current, setCurrent] = useState(0);
  const [isLoadding, setLoadding] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: SCREENS.sm });

  const { topCars } = useSelector(stateSelector);
  const { setTopCars } = actionDispatch(useDispatch());

  const fetchTopCars = async () => {
    setLoadding(true);
    const cars = await carsService.getCars().catch((err) => {
      console.log("Error: ", err);
    });

    // await wait(5000);

    console.log("Car: ", cars);
    if (cars) setTopCars(cars);
    setLoadding(false);
  };

  // const testCar: ICar = {
  //   name: "Audi S3 Car",
  //   mileage: "10k",
  //   thumbnailSrc:
  //     "https://cdn.jdpower.com/Models/640x480/2017-Audi-S3-PremiumPlus.jpg",
  //   dailyPrice: 70,
  //   monthlyPrice: 1600,
  //   gearType: "Auto",
  //   gas: "Petrol",
  // };

  useEffect(() => {
    fetchTopCars();
  }, []);

  const isEmptyTopCars = !topCars || topCars.length === 0;

  const cars =
    (!isEmptyTopCars &&
      topCars.map((cars) => (
        <Car {...cars} thumbnailSrc={cars.thumbnailUrl} />
      ))) ||
    [];

  const numberOfDots = isMobile ? cars.length : Math.ceil(cars.length / 3);

  return (
    <TopCarsContainer>
      <Title>Explore Our Deals</Title>
      {isLoadding && (
        <LoadingContainer>
          <MoonLoader loading />
        </LoadingContainer>
      )}
      {isEmptyTopCars && !isLoadding && <EmptyCars>No Cars To Show!</EmptyCars>}
      {!isEmptyTopCars && !isLoadding && (
        <CarsContainer>
          <Carousel
            value={current}
            onChange={setCurrent}
            slides={cars}
            plugins={[
              "clickToChange",
              {
                resolve: slidesToShowPlugin,
                options: {
                  numberOfSlides: 3,
                },
              },
            ]}
            breakpoints={{
              640: {
                plugins: [
                  {
                    resolve: slidesToShowPlugin,
                    options: {
                      numberOfSlides: 1,
                    },
                  },
                ],
              },
              900: {
                plugins: [
                  {
                    resolve: slidesToShowPlugin,
                    options: {
                      numberOfSlides: 2,
                    },
                  },
                ],
              },
            }}
          />
          <Dots value={current} onChange={setCurrent} number={numberOfDots} />
        </CarsContainer>
      )}
    </TopCarsContainer>
  );
}
