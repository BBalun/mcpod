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
  const { hdNumber } = useParams();
  const navigate = useNavigate();

  const [selectedRefs, setSelectedRefs] = useState([] as string[]);

  if (!hdNumber || isNaN(Number(hdNumber))) {
    console.error("Invalid hdNumber param:", hdNumber);
    return <Navigate to="/" />;
  }

  const { data, error } = trpc.getReferences.useQuery({
    hdNumber: Number(hdNumber),
  });

  if (!data && !error) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Error ocurred. Try again later.</div>;
  }

  return (
    <main className="container flex h-full w-full flex-col items-center justify-center gap-3 lg:p-20">
      <div className="w-full text-left">
        <h1 className="text-lg font-bold ">References for HD {hdNumber}</h1>
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
                  checked={selectedRefs.includes(reference.reference)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRefs((refs) => [...refs, reference.reference]);
                    } else {
                      setSelectedRefs((refs) =>
                        refs.filter((r) => r !== reference.reference)
                      );
                    }
                  }}
                />
              </td>
              <td>{reference.reference}</td>
              <td>{reference.hdNumber}</td>
              <td>{reference.author}</td>
              <td>
                {reference.bibCode}
                {reference.bibCode && (
                  <span>
                    (
                    <a href={generateLinkToAds(reference.bibCode)}>
                      Link to ADS
                    </a>
                    )
                  </span>
                )}
              </td>
              <td>{reference.sStar}</td>
              <td>{reference.description}</td>
              <td>
                <Link
                  to={`/observations/${hdNumber}/${reference.reference}`}
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
        <Link to={`/star/${hdNumber}`}>
          <Button colorScheme="blackAlpha">Go back to star data</Button>
        </Link>
        <Button
          colorScheme="blackAlpha"
          isDisabled={selectedRefs.length === 0}
          onClick={() =>
            navigate(
              `/star/${hdNumber}?${selectedRefs
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
