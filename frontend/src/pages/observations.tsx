import { Link, Navigate, useParams } from "react-router-dom";
import { trpc } from "../utils/trpc";

import styles from "../styles/table.module.css";
import { Button, useToast } from "@chakra-ui/react";

const observations = () => {
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

  const { data } = trpc.getObservations.useQuery(
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

  if (!data || !mainId) {
    // error ocurred
    return null;
  }

  if (data.length === 0) {
    return (
      <div>
        No data found for star {mainId} in references {referenceId}
        <Link to={`/references/${starId}`}>
          <Button colorScheme="facebook">Go back to references</Button>
        </Link>
      </div>
    );
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
          <tbody>
            {data.map((observation) => (
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

      <div className="flex w-full justify-end">
        <Link to={`/references/${starId}`}>
          <Button colorScheme="facebook">Go back to references</Button>
        </Link>
      </div>
    </main>
  );
};

export default observations;
