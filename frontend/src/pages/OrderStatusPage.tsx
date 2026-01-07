import { useGetMyOrders } from "@/api/OrderApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


const OrderStatusPage = () => {
  const { orders, isLoading } = useGetMyOrders();

  if (isLoading) {
    return "Loading...";
  }

  if (!orders || orders.length === 0) {
    return "No orders found";
  }

  return (
    <div className="space-y-10">
      {orders.map((order) => (
        <div className="space-y-10 bg-gray-50 p-10 rounded-lg" key={order._id}>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Left: Order Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold tracking-tight mb-5">
                    Order Status: {order.status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold">
                      Expected by:{" "}
                      {getExpectedDelivery(
                        order.createdAt,
                        order.restaurant.estimatedDeliveryTime
                      )}
                    </span>
                    <span>
                      Ship to: {order.deliveryDetails.name},{" "}
                      {order.deliveryDetails.addressLine1},{" "}
                      {order.deliveryDetails.city}
                    </span>
                    <div className="grid gap-2 mt-4">
                      {order.cartItems.map((item) => (
                        <span key={item.menuItemId}>
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col">
                      <span className="font-bold">
                        Total: £{(order.totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Restaurant Image */}
            <div className="flex flex-col gap-5">
              <AspectRatio ratio={16 / 5}>
                <img
                  src={order.restaurant.imageUrl}
                  className="rounded-md object-cover h-full w-full"
                />
              </AspectRatio>
              <h1 className="text-3xl font-bold">
                Order from {order.restaurant.restaurantName}
              </h1>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple helper function to calculate time
const getExpectedDelivery = (created: string, minutes: number) => {
  const createdDate = new Date(created);
  createdDate.setMinutes(createdDate.getMinutes() + minutes);

  const hours = createdDate.getHours();
  const mins = createdDate.getMinutes();
  const paddedMins = mins < 10 ? `0${mins}` : mins;

  return `${hours}:${paddedMins}`;
};

export default OrderStatusPage;
