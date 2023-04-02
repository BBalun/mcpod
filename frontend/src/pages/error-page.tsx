import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError() as any;
  console.error(error);

  const notFound = error?.status === 404;

  return (
    <main className="mt-[20rem] w-full px-3 text-center">
      <h1 className="text-2xl font-semibold">
        {notFound ? "Page not found" : "Oops!"}
      </h1>
      {notFound ? (
        <p>
          Page you are looking for does not exist. Click{" "}
          <Link to="/" className="a-link">
            here
          </Link>{" "}
          to go back to the homepage.
        </p>
      ) : (
        <p>Sorry, an unexpected error has occurred.</p>
      )}
    </main>
  );
};

export default ErrorPage;
