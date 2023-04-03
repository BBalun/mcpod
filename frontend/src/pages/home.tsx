import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Search from "../components/Search";
import { trpc } from "../utils/trpc";

const Home = () => {
  const toast = useToast();

  let { data } = trpc.getHomepageStatistics.useQuery(undefined, {
    suspense: true,
    onError(e) {
      console.error(e);
      toast({
        description: "Unable to fetch data from the server",
        status: "error",
        position: "bottom-right",
      });
    },
  });

  data ??= {
    numOfMeasurements: 0,
    numOfStars: 0,
  };

  return (
    <main className="">
      <section className="flex h-[600px] items-center justify-center">
        <StarsBackground />
        <div className="w-10/12 sm:w-2/3 lg:w-1/2 lg:max-w-3xl">
          <Search />
        </div>
      </section>
      <div className="mx-auto w-10/12 pt-12 pb-20 sm:w-2/3 lg:w-1/2 lg:max-w-3xl">
        <section id="about" className="">
          <h2 className="text-2xl">What is mCPod?</h2>
          <hr className="mb-2" />
          <p>
            <span className="font-semibold">mCPod</span> is an on-line database
            of photometric observations of magnetic chemically peculiar stars
            (hereafter mCP stars), the result of close cooperation of the
            following european institutes:
          </p>
          <ul className="ml-5 list-disc pt-1">
            <li>
              Astrophysics Division, Department of Theoretical Physics and
              Astropysics, Faculty of Science, Masaryk University, Kotlářská 2,
              CZ-611 37 Brno, Czechia (
              <a className="a-link" href="https://astro.physics.muni.cz">
                https://astro.physics.muni.cz
              </a>
              )
            </li>
            <li>
              Astronomical Institute, Slovak Academy of Sciences, SK-059 60
              Tatranská Lomnica, Slovak Republic (
              <a className="a-link" href="https://www.ta3.sk">
                https://www.ta3.sk
              </a>
              )
            </li>
          </ul>
          <p className="pt-1">
            The goal of this extensive project is to collect all published data
            of photometric observations of mCP stars in optical and near
            infrared band.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="text-2xl">Why mCPod?</h2>
          <hr className="mb-2" />
          <p>
            The acronym mCPod (mCP observation database) was coined by Zdeněk
            Mikulášek in 2007 in order to simplify referring to our database in
            electronic and personal communication. The noticeable similarity to
            the name of the most popular MP3 player is not arbitrary. It is
            suggesting the fact that the database was created in order to make
            routine tasks enjoyable. It is supposed to be one of the tiny little
            things that give meaning to the astrophysicist's life.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="text-2xl">
            How much data can one find in the database?
          </h2>
          <hr className="mb-2" />
          <p>
            Nowadays mCPod contains{" "}
            <span className="font-semibold">
              {data.numOfMeasurements.toLocaleString()} photometric measurements
              of {data.numOfStars.toLocaleString()} mCP stars
            </span>
            . This number is growing up constantly as we are feeding the
            database with recent photometric data.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="text-2xl">How to contact mCPod developers?</h2>
          <hr className="mb-2" />
          <p>
            Please, send any comments, suggestions and bug reports to any of the{" "}
            <Link className="a-link" to="/contact">
              present authors and maintainers.
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

function StarsBackground() {
  return (
    <div className="star-bg -z-1 absolute h-[600px] w-full overflow-hidden">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  );
}

export default Home;
