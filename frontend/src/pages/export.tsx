import { SmallCloseIcon } from "@chakra-ui/icons";
import { Button, Input, Spinner, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useState } from "react";
import DateFilters from "../components/DateFilters";
import Filters from "../components/Filters";
import { useFetchSystems } from "../hooks/useFetchSystems";
import { RouterOutput } from "../types/trpc";
import { trpc } from "../utils/trpc";

const ExportPage = () => {
  const [stars, setStars] = useState<NonNullable<RouterOutput["search"]>[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();

  const [filters, setFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<number>();
  const [endDate, setEndDate] = useState<number>();

  const systems = useFetchSystems();

  const toast = useToast();

  const { client } = trpc.useContext();
  const { mutateAsync: search, isLoading } = useMutation(
    ["search", input],
    client.search.query,
    {
      onError(e) {
        console.error(e);
        toast({
          description: "Something went wrong",
          status: "error",
          position: "bottom-right",
        });
      },
    }
  );

  const { mutateAsync: exportToCsv, isLoading: isExportLoading } = useMutation(
    ["export", filters, startDate, endDate, stars],
    client.exportDataToCsv.query
  );

  async function submit() {
    const starId = await search(input);
    if (starId === null) {
      setError(`Start '${input}' not found`);
      return;
    }
    setInput("");

    const s = stars.find((star) => star.oid === starId.oid);
    if (s) {
      console.warn(`star is already in the list (${s.mainId})`);
      toast({
        description: `Star is already in the list (${s.mainId})`,
        status: "info",
        position: "bottom-right",
      });
      return;
    }
    setStars([...stars, starId]);
  }

  async function exportData() {
    const csv = await exportToCsv({
      starIds: stars.length ? stars.map((s) => s.oid) : undefined,
      filters: filters.length ? filters : undefined,
      startDate,
      endDate,
    });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), "export.csv");
  }

  return (
    <main className="mb-12 mt-7 flex w-full flex-col items-center">
      <div className="flex w-full flex-col gap-3 lg:w-1/2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Step 1: Choose filters (leave empty to select all):
          </h2>
          <div className="ml-2 mt-1">
            <Filters
              systems={systems!}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </section>
        <hr />
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Step 2: Select start end date (leave empty to select all)
          </h2>
          <div className="ml-2 mt-1">
            <DateFilters
              heading=""
              onDateChange={(newStartDate, newEndDate) => {
                setStartDate(newStartDate);
                setEndDate(newEndDate);
              }}
            />
          </div>
        </section>
        <hr />
        <section className="flex flex-col justify-end gap-4">
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Step 3: Select stars(leave empty to select all)
            </h2>
            <div className="ml-2 mt-1">
              <p className="text-md font-semibold">Selected stars:</p>
              <ul className="list-none">
                {stars.length === 0 ? (
                  <p>(None)</p>
                ) : (
                  stars.map((star) => (
                    <li
                      key={star.oid}
                      className="flex flex-row items-center gap-1"
                    >
                      <button
                        onClick={() =>
                          setStars((stars) => stars.filter((s) => s !== star))
                        }
                      >
                        <SmallCloseIcon className="text-sm" />
                      </button>
                      {star.mainId}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="flex flex-row gap-2">
              <Input
                type="text"
                name="starId"
                aria-label="star identifier"
                placeholder="Enter star identifier"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
              />
              <Button colorScheme="facebook" type="submit" className="w-1/5">
                {isLoading ? <Spinner size="sm" /> : "Add"}
              </Button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
          <Button
            colorScheme="facebook"
            className="mt-1"
            onClick={exportData}
            isDisabled={isExportLoading || isLoading}
          >
            {isExportLoading ? (
              <Spinner size="sm" />
            ) : (
              "Export data to CSV file"
            )}
          </Button>
        </section>
      </div>
    </main>
  );
};

export default ExportPage;
