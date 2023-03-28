import { trpc } from "../utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { fetchSystems } from "../services/fetchSystems";
import DateFilters from "../components/DateFilters";
import Filters from "../components/Filters";
import DataChart from "../components/Chart";
import PhaseCurveChartSection from "../components/PhaseCurveChartSection";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ForwardedRef, useRef, useState } from "react";
import { Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import { Chart } from "chart.js";

const Star = () => {
  const { starId: starIdString } = useParams();

  const starId = /^[0-9]+$/.test(starIdString ?? "")
    ? Number(starIdString)
    : null;

  if (!starId) {
    return <Navigate to="/" />;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const referenceIds = searchParams.getAll("reference");

  const [filters, setFilters] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<number>();
  const [endDate, setEndDate] = useState<number>();

  const [error, setError] = useState<string>();

  const [dateFilters, setDateFilters] = useState<
    [number | undefined, number | undefined]
  >([undefined, undefined]);

  const dataChartRef = useRef<Chart<"scatter", any, any>>();

  const { data: mainId } = trpc.getMainId.useQuery(
    {
      starId,
    },
    {
      onError: (e) => {
        console.error("Failed to fetch main id");
        console.error(e);
        setError("Failed to fetch star main identifier");
      },
    }
  );

  const { data: systems } = useQuery(["systems"], fetchSystems, {
    onError(error) {
      console.error("Fetching of systems failed");
      console.error(error);
      setError("Failed to fetch systems and filters");
    },
  });

  const { data } = trpc.getData.useQuery(
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
        setError("Failed to fetch data for star " + starId);
      },
      staleTime: Infinity,
    }
  );

  if (error) {
    return (
      <div>
        <p>
          Unexpected error occurred while fetching systems. Please try again
          later.
        </p>
        <p>({error})</p>
      </div>
    );
  }

  if (!systems || !mainId) {
    // TODO: show loading spinner
    return <div>Loading...</div>;
  }

  function download(format: "png" | "csv") {
    const xRange = dataChartRef.current!.scales.x.getMinMax(true);
    const yRange = dataChartRef.current!.scales.y.getMinMax(true);
    const visibleData = Object.values(data!)
      .flatMap((x) => x)
      .filter(
        ({ julianDate, magnitude }) =>
          julianDate >= xRange.min &&
          julianDate <= xRange.max &&
          magnitude >= yRange.min &&
          magnitude <= yRange.max
      );
    console.log(visibleData);

    // console.log(dataChartRef.current);
  }

  return (
    <div className="flex w-full flex-row gap-1 px-7 pt-2">
      <section className="w-1/3">
        <h1 className="text-lg font-bold">
          Database Query Result for {mainId}
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
          <Button colorScheme="gray" variant="solid" w="full">
            Go to references
          </Button>
        </Link>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            w={"full"}
            className="mb-10 mt-2"
          >
            Download
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => download("csv")}>Download as CSV</MenuItem>
            {/* <MenuItem onClick={}>Download as TXT</MenuItem> */}
            <MenuItem onClick={() => download("png")}>Download as PNG</MenuItem>
          </MenuList>
        </Menu>
      </section>

      <section className="flex w-2/3 flex-col">
        {/* TODO: show loading skeleton */}
        {data && (
          <DataChart
            ref={dataChartRef}
            data={data}
            mainId={mainId}
            systems={systems}
          />
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
    </div>
  );
};

export default Star;
