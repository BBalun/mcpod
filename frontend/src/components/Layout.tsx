import React from "react";
import { Link } from "react-router-dom";
import LoadingLayout from "./LoadingLayout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-w-screen min-h-screen bg-slate-100">
      <LoadingLayout>
        <NavBar />
        {children}
      </LoadingLayout>
    </div>
  );
};

function NavBar() {
  return (
    <nav className="flex h-16 w-full overflow-hidden bg-slate-800 px-3 text-slate-100">
      <div className="container mx-auto flex h-full flex-row items-center gap-9">
        <Link to="/" className="mr-12 text-2xl font-light">
          mCPod
        </Link>
        <Link to="/">Search</Link>
        <Link to="/export">Export</Link>
        <Link to="/#about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}

export default Layout;
