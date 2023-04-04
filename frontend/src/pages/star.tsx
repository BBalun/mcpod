import { trpc } from "../utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { fetchSystems } from "../services/fetchSystems";
import DateFilters from "../components/DateFilters";
import Filters from "../components/Filters";
import DataChart from "../components/Chart";
import PhaseCurveChartSection from "../components/PhaseCurveChartSection";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";

const Star = () => {
  const { starId: starIdString } = useParams();

  const starId = /^[0-9]+$/.test(starIdString ?? "")
    ? Number(starIdString)
    : null;

  if (!starId) {
    return <Navigate to="/" />;
  }

  const [searchParams, _setSearchParams] = useSearchParams();
  const referenceIds = searchParams.getAll("reference");
  const toast = useToast();

  const [filters, setFilters] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<number>();
  const [endDate, setEndDate] = useState<number>();

  const [dateFilters, setDateFilters] = useState<
    [number | undefined, number | undefined]
  >([undefined, undefined]);

  const { data: mainId, isLoading: isMainIdLoading } = trpc.getMainId.useQuery(
    {
      starId,
    },
    {
      onError(e) {
        console.error("Failed to fetch main id");
        console.error(e);
        toast({
          description: "Failed to fetch star main identifier",
          status: "error",
          position: "bottom-right",
        });
      },
      staleTime: Infinity,
    }
  );

  const { data: systems, isLoading: areSystemsLoading } = useQuery(
    ["systems"],
    fetchSystems,
    {
      onError(error) {
        console.error("Fetching of systems failed");
        console.error(error);
        toast({
          description: "Failed to fetch systems and filters",
          status: "error",
          position: "bottom-right",
        });
      },
      staleTime: Infinity,
    }
  );

  const { data: trpcData, isLoading: isDataLoading } = trpc.getData.useQuery(
    {
      starId,
      filters,
      startDate: dateFilters[0],
      endDate: dateFilters[1],
      referenceIds,
    },
    {
      enabled: !!systems,
      onError(e) {
        console.error("Failed to fetch data");
        console.error(e);
        toast({
          description: "Failed to fetch data for star " + starId,
          status: "error",
          position: "bottom-right",
        });
      },
      staleTime: Infinity,
    }
  );

  const { setSpinnerVisibility } = useGlobalLoadingSpinner();

  useEffect(() => {
    setSpinnerVisibility(isDataLoading || isMainIdLoading || areSystemsLoading);
  }, [isDataLoading, isMainIdLoading, areSystemsLoading]);

  const [data, setData] = useState(trpcData);
  useEffect(() => {
    if (trpcData) {
      setData(trpcData);
    }
  }, [trpcData]);

  if (!systems || !mainId) {
    // when error occurs
    return null;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto">
        <main className="flex w-full flex-col justify-center gap-9 px-9 pb-12 pt-9 lg:flex-row xl:px-20">
          <section className="min-w-1/3">
            <h1 className="text-2xl font-light">
              Database Query Result for {mainId}
              {referenceIds.length > 0 && " for selected references"}
            </h1>
            <hr className="my-3" />
            <Filters
              systems={systems}
              filters={filters}
              setFilters={setFilters}
            />
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
                colorScheme="facebook"
                variant="solid"
                w="full"
                className="mt-2"
              >
                Submit
              </Button>
            </form>
            <hr className="my-3" />
            <Link to={`/references/${starId}`}>
              <Button colorScheme="facebook" variant="solid" w="full">
                Go to references
              </Button>
            </Link>
          </section>

          <section className="flex w-full flex-col lg:w-2/3">
            {data && (
              <DataChart data={data} mainId={mainId} systems={systems} />
            )}
            <hr className="my-3" />

            <PhaseCurveChartSection
              starId={starId}
              mainId={mainId}
              systems={systems}
              filters={filters}
              startDate={dateFilters[0]}
              endDate={dateFilters[1]}
              referenceIds={referenceIds}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Star;
