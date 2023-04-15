import { useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Search from "../components/Search";
import { useStaticContent } from "../hooks/useStaticContent";
import { trpc } from "../utils/trpc";

const Home = () => {
  const toast = useToast();
  const homePageHtmlRaw = useStaticContent("home");

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

  const homePageHtml = homePageHtmlRaw
    ?.replace(
      "{{numberOfMeasurements}}",
      data.numOfMeasurements.toLocaleString()
    )
    ?.replace("{{numberOfStars}}", data.numOfStars.toLocaleString());

  return (
    <main>
      <section className="flex h-[600px] items-center justify-center">
        <StarsBackground />
        <div className="w-10/12 sm:w-2/3 lg:w-1/2 lg:max-w-3xl">
          <Search />
        </div>
      </section>
      <div className="mx-auto w-10/12 pt-12 pb-20 sm:w-2/3 lg:w-1/2 lg:max-w-3xl">
        <div dangerouslySetInnerHTML={{ __html: homePageHtml ?? "" }} />
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
