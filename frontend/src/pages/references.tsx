import {
  createSearchParams,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { trpc } from "../utils/trpc";
import { Link } from "react-router-dom";

import styles from "../styles/table.module.css";
import { useRef, useState } from "react";
import { Button } from "@chakra-ui/button";

function generateLinkToAds(bibCode: string) {
  return `https://adsabs.harvard.edu/cgi-bin/nph-abs_connect?db_key=ALL&PRE=YES&warnings=YES&version=1&bibcode=${bibCode}&nr_to_return=100&start_nr=1`;
}

const references = () => {
  const { starId: starIdString } = useParams();
  const navigate = useNavigate();

  const [selectedRefs, setSelectedRefs] = useState([] as string[]);
  const [error, setError] = useState<string>();

  const starId = /^[0-9]+$/.test(starIdString ?? "")
    ? Number(starIdString)
    : null;

  if (!starId) {
    console.error("Invalid starId param:", starIdString);
    return <Navigate to="/" />;
  }

  const { data } = trpc.getReferences.useQuery(
    {
      starId,
    },
    {
      onError: (e) => {
        console.error(`Failed to fetch references for star with id ${starId}`);
        console.error(e);
        setError(`Failed to fetch references for star with id ${starId}`);
      },
    }
  );

  const { data: mainId } = trpc.getMainId.useQuery(
    { starId },
    {
      onError: (e) => {
        console.error(`Failed to fetch main id for star with id ${starId}`);
        console.error(e);
        setError(`Failed to fetch main id for star with id ${starId}`);
      },
    }
  );

  if (error) {
    console.error(error);
    return <div>Error ocurred. Try again later.</div>;
  }

  if (!data || !mainId) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container flex h-full w-full flex-col items-center justify-center gap-3 lg:p-20">
      <div className="w-full text-left">
        <h1 className="text-lg font-bold ">References for {mainId}</h1>
      </div>
      <table className={"table w-full " + styles.table}>
        <thead>
          <tr>
            <th></th>
            <th className="font-semibold">Ref. No.</th>
            <th className="font-semibold">Star HD No.</th>
            <th className="font-semibold">Source</th>
            <th className="font-semibold">Bibcode</th>
            <th className="font-semibold">Comp HD No.</th>
            <th className="font-semibold">Other</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((reference) => (
            <tr key={reference.id}>
              <td>
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
              <td>{reference.referenceId}</td>
              {/* TODO: another issue, what should be now displayed here */}
              {/* Ideal solution: remove this column. Name of the star (main id) is displayed as page heading */}
              <td>{reference.starId}</td>
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
              {/* TODO: what to do with description */}
              {/* One option is to calculate it on a fly on a server and include results in the response */}
              {/* <td>{reference.description}</td> */}

              <td>
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
      <div className="flex w-full flex-row justify-end gap-3">
        <Link to={`/star/${starId}`}>
          <Button colorScheme="blackAlpha">Go back to star data</Button>
        </Link>
        <Button
          colorScheme="blackAlpha"
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
      </div>
    </main>
  );
};

export default references;
