import { trpc } from "../utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { fetchSystems } from "../services/fetchSystems";
import DateFilters from "../components/DateFilters";
import Filters from "../components/Filters";
import DataChart from "../components/Chart";
import PhaseCurveChartSection from "../components/PhaseCurveChartSection";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@chakra-ui/react";

const Star = () => {
  const { starId } = useParams();

  if (!starId) {
    return <Navigate to="/" />;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const referenceIds = searchParams.getAll("reference");

  const [filters, setFilters] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<number>();
  const [endDate, setEndDate] = useState<number>();

  const [dateFilters, setDateFilters] = useState<
    [number | undefined, number | undefined]
  >([undefined, undefined]);

  const {
    data: systems,
    isLoading: isSystemLoading,
    isError: isErrorLoading,
    error: systemError,
  } = useQuery(["systems"], fetchSystems);

  const {
    data,
    isLoading: starDataLoading,
    isError: isStarDataError,
    error: starDataError,
  } = trpc.getStarData.useQuery(
    {
      starId,
      filters,
      startDate: dateFilters[0],
      endDate: dateFilters[1],
      referenceIds,
    },
    {
      enabled: !!systems,
    }
  );

  if (isErrorLoading || isStarDataError) {
    console.error(systemError || starDataError);
    return (
      <div>
        Unexpected error occurred while fetching systems. Please try again
        later.
      </div>
    );
  }

  if (isSystemLoading) {
    // TODO: show loading spinner
    return <div>Loading...</div>;
  }

  return (
    <div className="flex w-full flex-row gap-1 px-7 pt-2">
      <section className="w-1/3">
        <h1 className="text-lg font-bold">
          Database Query Result for {starId}
          {referenceIds.length > 0 && " for selected references"}
        </h1>
        <hr className="my-3" />
        <Filters systems={systems} filters={filters} setFilters={setFilters} />
        <hr className="my-3" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDateFilters([startDate, endDate]);
          }}
        >
          <DateFilters
            onDateChange={(newStartDate, newEndDate) => {
              setStartDate(newStartDate);
              setEndDate(newEndDate);
            }}
          />

          <Button
            type="submit"
            colorScheme="gray"
            variant="solid"
            w="full"
            className="mt-2"
          >
            Submit
          </Button>
        </form>
        <hr className="my-3" />
        <Link to={`/references/${starId}`}>
          <Button colorScheme="gray" variant="solid" w="full" className="mb-10">
            Go to references
          </Button>
        </Link>
      </section>

      <section className="flex w-2/3 flex-col">
        {data && (
          <>
            <DataChart
              data={data.chartData}
              starId={starId}
              systems={systems}
            />
            <hr className="my-3" />

            <PhaseCurveChartSection
              starId={starId}
              systems={systems}
              initialData={data.phasedLightCurveChartData}
              filters={filters}
              initialEphemerids={data.ephemerids}
              allIdentifiers={data.identifiers}
              startDate={dateFilters[0]}
              endDate={dateFilters[1]}
              referenceIds={referenceIds}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default Star;
