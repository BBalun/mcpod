import { Link, Navigate, useParams } from "react-router-dom";
import { trpc } from "../utils/trpc";

import styles from "../styles/table.module.css";
import { Button } from "@chakra-ui/react";

const observations = () => {
  const { hdNumber, reference } = useParams();

  if (!hdNumber || !reference || isNaN(Number(hdNumber))) {
    console.error("Invalid parameters received", { hdNumber, reference });
    return <Navigate to="/" />;
  }

  const { data, error } = trpc.getObservations.useQuery({
    hdNumber: Number(hdNumber),
    reference: Number(reference).toString(), // TODO: not an ideal solution
  });

  if (!data && !error) {
    return <div>Loading ...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Something went wrong. Try again later</div>;
  }

  if (data.length === 0) {
    return (
      <div>
        No data found for star HD {hdNumber} in references No. {reference}
        <Link to={`/references/${hdNumber}`}>
          <Button>Go back to references</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="container flex h-full w-full flex-col items-center justify-center gap-3 lg:p-20">
      <div className="w-full text-left">
        <h1 className="text-lg font-bold">
          Dataset statistics for star HD {hdNumber} in reference No. {reference}
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
              <td>{observation.magnitudeAverage}</td>
              <td>{observation.magnitudeError}</td>
              <td>{observation.stdErr}</td>
              <td>{observation.amlitEff}</td>
              <td>{observation.lambdaEff}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex w-full justify-end">
        <Link to={`/references/${hdNumber}`}>
          <Button colorScheme="blackAlpha">Go back to references</Button>
        </Link>
      </div>
    </main>
  );
};

export default observations;
