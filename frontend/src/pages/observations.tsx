import { Link, Navigate, useParams } from "react-router-dom";
import { trpc } from "../utils/trpc";
import styles from "../styles/table.module.css";
import { Button, useToast } from "@chakra-ui/react";
import papaparse from "papaparse";
import saveAs from "file-saver";

const ObservationsPage = () => {
  const { starId: starIdString, referenceId } = useParams();
  const toast = useToast();

  const starId = /^[0-9]+$/.test(starIdString ?? "")
    ? Number(starIdString)
    : null;

  if (starId === null || referenceId === undefined) {
    console.error("Invalid parameters received", {
      starIdString,
      referenceId,
    });
    return <Navigate to="/" />;
  }

  const { data: observations } = trpc.getObservations.useQuery(
    {
      starId,
      referenceId,
    },
    {
      onError: (e) => {
        console.error(e);
        console.error("Failed to fetch observations");
        toast({
          description: "Failed to fetch observations",
          status: "info",
          position: "bottom-right",
        });
      },
      suspense: true,
    }
  );

  const { data: mainId } = trpc.getMainId.useQuery(
    { starId },
    {
      onError: (e) => {
        console.error(e);
        console.error("Failed to fetch mainId");
        toast({
          description: "Failed to fetch mainId",
          status: "info",
          position: "bottom-right",
        });
      },
      suspense: true,
      staleTime: Infinity,
    }
  );

  if (!observations || !mainId) {
    // error ocurred
    return null;
  }

  if (observations.length === 0) {
    return (
      <div>
        No data found for star {mainId} in references {referenceId}
        <Link to={`/references/${starId}`}>
          <Button colorScheme="facebook">Go back to references</Button>
        </Link>
      </div>
    );
  }

  function exportObservations() {
    if (!observations) {
      return;
    }

    const data = observations.map((observation) => ({
      star: mainId,
      referenceId: observation.referenceId,
      filter: observation.filter,
      count: observation.count,
      magavg: observation.magAverage,
      magerr: observation.magError,
      stderr: observation.stdError,
      amplitudeEff: observation.amplitudeEff,
      lambdaEff: observation.lambdaEff,
    }));

    const csv = papaparse.unparse(data, {
      header: true,
      columns: [
        "star",
        "referenceId",
        "filter",
        "count",
        "magavg",
        "magerr",
        "stderr",
        "amplitudeEff",
        "lambdaEff",
      ],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${mainId}-${referenceId}-observations.csv`);
  }

  return (
    <main className="container mx-auto h-full w-full items-center justify-center gap-3 p-3 lg:p-20">
      <h1 className="mb-3 text-3xl font-light">
        Dataset statistics for star {mainId} in references {referenceId}
      </h1>

      <div className="mb-4 overflow-x-auto rounded-xl">
        <table className={"table w-full " + styles.table}>
          <thead>
            <tr>
              <th>Filter</th>
              <th>No.&nbsp;measurements</th>
              <th>magavg</th>
              <th>magerr</th>
              <th>stderr</th>
              <th>eff.&nbsp;amplitude</th>
              <th>lambda&nbsp;eff</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {observations.map((observation) => (
              <tr key={observation.id}>
                <td>{observation.filter}</td>
                <td>{observation.count}</td>
                <td>{observation.magAverage}</td>
                <td>{observation.magError}</td>
                <td>{observation.stdError}</td>
                <td>{observation.amplitudeEff}</td>
                <td>{observation.lambdaEff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex w-full justify-end gap-2">
        <Link to={`/references/${starId}`}>
          <Button colorScheme="facebook">Go back to references</Button>
        </Link>
        <Button colorScheme="facebook" onClick={exportObservations}>
          Export to CSV
        </Button>
      </div>
    </main>
  );
};

export default ObservationsPage;
