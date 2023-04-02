import { Link, Navigate, useParams } from "react-router-dom";
import { trpc } from "../utils/trpc";

import styles from "../styles/table.module.css";
import { Button } from "@chakra-ui/react";
import { useState } from "react";

const observations = () => {
  const { starId: starIdString, referenceId } = useParams();

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

  const [error, setError] = useState<string>();

  const { data } = trpc.getObservations.useQuery(
    {
      starId,
      referenceId,
    },
    {
      onError: (e) => {
        console.error(e);
        console.error("Failed to fetch observations");
        setError("Failed to fetch observations");
      },
    }
  );

  const { data: mainId } = trpc.getMainId.useQuery(
    { starId },
    {
      onError: (e) => {
        console.error(e);
        console.error("Failed to fetch mainId");
        setError("Failed to fetch star data");
      },
    }
  );

  if (error) {
    console.error(error);
    return <div>Something went wrong. Try again later</div>;
  }

  if (!data || !mainId) {
    return <div>Loading ...</div>;
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
    <main className="container flex h-full w-full flex-col items-center justify-center gap-3 lg:p-20">
      <div className="w-full text-left">
        <h1 className="text-lg font-bold">
          Dataset statistics for star {mainId} in references {referenceId}
        </h1>
      </div>

      <table className={"table w-full " + styles.table}>
        <thead>
          <tr>
            <th>Filter</th>
            <th>No. measurements</th>
            <th>magavg</th>
            <th>magerr</th>
            <th>stderr</th>
            <th>eff. amplitude</th>
            <th>lambda eff</th>
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
      <div className="flex w-full justify-end">
        <Link to={`/references/${starId}`}>
          <Button colorScheme="facebook">Go back to references</Button>
        </Link>
      </div>
    </main>
  );
};

export default observations;
