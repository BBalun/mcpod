import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { trpc } from "../utils/trpc";
import { Link } from "react-router-dom";
import styles from "../styles/table.module.css";
import { useState } from "react";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/react";
import { useFetchSystems } from "../hooks/useFetchSystems";
import { Filter } from "../types/systems";
import papaparse from "papaparse";
import saveAs from "file-saver";

function generateLinkToAds(bibCode: string) {
  return `https://adsabs.harvard.edu/cgi-bin/nph-abs_connect?db_key=ALL&PRE=YES&warnings=YES&version=1&bibcode=${encodeURIComponent(
    bibCode
  )}&nr_to_return=100&start_nr=1`;
}

const references = () => {
  const { starId: starIdString } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const systems = useFetchSystems();
  const filters = systems?.flatMap((system) => system.filters);

  const [searchParams, _setSearchParams] = useSearchParams();
  const filtersParams = searchParams.getAll("filters");

  const [selectedRefs, setSelectedRefs] = useState([] as string[]);

  const starId = /^[0-9]+$/.test(starIdString ?? "")
    ? Number(starIdString)
    : null;

  if (!starId) {
    console.error("Invalid starId param:", starIdString);
    return <Navigate to="/" />;
  }

  const { data: mainId } = trpc.getMainId.useQuery(
    { starId },
    {
      onError: (e) => {
        console.error(`Failed to fetch main id for star with id ${starId}`);
        console.error(e);
        toast({
          description: `Failed to fetch main id for star with id ${starId}`,
          status: "error",
          position: "bottom-right",
        });
      },
      staleTime: Infinity,
      suspense: true,
    }
  );

  const { data: references } = trpc.getReferences.useQuery(
    {
      starId,
      filters: filtersParams.length ? filtersParams : undefined,
    },
    {
      onError: (e) => {
        console.error(`Failed to fetch references for star with id ${starId}`);
        console.error(e);
        toast({
          description: `Failed to fetch references for star with id ${starId}`,
          status: "error",
          position: "bottom-right",
        });
      },
      staleTime: Infinity,
      suspense: true,
    }
  );

  if (!references || !mainId) {
    // error
    return null;
  }

  function exportReferences() {
    if (!references) {
      return;
    }
    const data = references.map((ref) => ({
      referenceId: ref.referenceId,
      star: mainId,
      source: ref.author,
      bibcode: ref.bibcode,
      compHdNum: ref.referenceStarIds,
      other: createOtherColumn(filters, ref.observations),
    }));

    const csv = papaparse.unparse(data, {
      header: true,
      columns: [
        "referenceId",
        "star",
        "source",
        "bibcode",
        "compHdNum",
        "other",
      ],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${mainId}-references.csv`);
  }

  return (
    <main className="container mx-auto h-full w-full items-center justify-center gap-3 p-3 lg:p-20">
      <h1 className="mb-3 text-3xl font-light">
        References for {mainId} {filters.length && " for selected filters"}
      </h1>

      <div className="mb-4 overflow-x-auto rounded-xl">
        <table className={"table w-full " + styles.table}>
          <thead>
            <tr>
              <th></th>
              <th className="font-semibold">Ref.&nbsp;ID</th>
              <th className="font-semibold">Star&nbsp;ID</th>
              <th className="font-semibold">Source</th>
              <th className="font-semibold">Bibcode</th>
              <th className="font-semibold">Comp&nbsp;HD&nbsp;No.</th>
              <th className="font-semibold">Other</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {references.map((reference) => (
              <tr key={reference.id}>
                <td className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRefs.includes(reference.referenceId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRefs((refs) => [
                          ...refs,
                          reference.referenceId,
                        ]);
                      } else {
                        setSelectedRefs((refs) =>
                          refs.filter((r) => r !== reference.referenceId)
                        );
                      }
                    }}
                  />
                </td>
                <td className="text-center">{reference.referenceId}</td>
                <td>{mainId}</td>
                <td>{reference.author}</td>
                <td>
                  {reference.bibcode}
                  {reference.bibcode && (
                    <span>
                      {" "}
                      (
                      <a
                        href={generateLinkToAds(reference.bibcode)}
                        className="a-link"
                      >
                        Link to ADS
                      </a>
                      )
                    </span>
                  )}
                </td>
                <td>{reference.referenceStarIds}</td>
                <td>{createOtherColumn(filters, reference.observations)}</td>

                <td className="text-center">
                  <Link
                    to={`/observations/${starId}/${reference.referenceId}`}
                    className="a-link"
                  >
                    Get statistics
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex w-full flex-row justify-end gap-3">
        <Link to={`/star/${starId}`}>
          <Button colorScheme="facebook">Go back to star data</Button>
        </Link>
        <Button
          colorScheme="facebook"
          isDisabled={selectedRefs.length === 0}
          onClick={() =>
            navigate(
              `/star/${starId}?${selectedRefs
                .map((r) => `reference=${r}`)
                .join("&")}`
            )
          }
        >
          Show data from selected references
        </Button>
        <Button colorScheme="facebook" onClick={() => exportReferences()}>
          Export to CSV
        </Button>
      </div>
    </main>
  );
};

function createOtherColumn(
  filters: Filter[],
  observations: Array<{ count: number; filter: string }>
) {
  return observations
    ?.map(
      (o) =>
        `${filters?.find((filter) => filter.code === o.filter)?.name}(${
          o.count
        })`
    )
    .join(", ");
}

export default references;
