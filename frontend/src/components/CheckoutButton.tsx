import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import UserProfileForm, {
  type UserFormData,
} from "../forms/user-profile-form/UserProfileForm";

type Props = {
  onCheckout: (userFormData: UserFormData) => void;
  disabled: boolean;
  isLoading: boolean;
};

const CheckoutButton = ({ onCheckout, disabled, isLoading }: Props) => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    loginWithRedirect,
  } = useAuth0();
  const { pathname } = useLocation();

  const onLogin = async () => {
    await loginWithRedirect({
      appState: { returnTo: pathname },
    });
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={onLogin}
        variant="default"
        className="bg-orange-500 flex-1"
      >
        Log in to check out
      </Button>
    );
  }

  if (isAuthenticated && !isAuthLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={disabled} className="bg-orange-500 flex-1">
            Go to Checkout
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[425px] md:min-w-[700px] bg-gray-50">
          {/* We will reuse the UserProfileForm here so they can confirm address */}
          <UserProfileForm
            currentUser={undefined}
            onSave={onCheckout}
            isLoading={isLoading}
            title="Confirm Delivery Details"
            buttonText="Continue to Payment"
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button variant="default" disabled>
      Loading...
    </Button>
  );
};

export default CheckoutButton;
