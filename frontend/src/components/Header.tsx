import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";

const Header = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="border-b-2 border-b-orange-500 py-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-bold tracking-tight text-orange-500"
        >
          MernEats.com
        </Link>
        <div className="md:hidden">
          <span>Mobile Menu</span>
        </div>
        <div className="hidden md:block">
          {isAuthenticated ? (
            <UsernameMenu />
          ) : (
            <Button
              variant="ghost"
              className="font-bold hover:text-orange-500 hover:bg-white"
              onClick={async () => await loginWithRedirect()}
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
