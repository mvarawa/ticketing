import useRequest from "../../hooks/use-request";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const {doRequest,errors} = useRequest({
    url: "/api/payments",
    method: "post",
    body:{
      orderId: order.id
    },
    onSuccess: ()=> Router.push("/orders")
  })
  useEffect(() => {
    const findTimeLeft = () => {
      const millisecondLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(millisecondLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    }
  }, [order])

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <div>
        Time left to pay: {timeLeft} seconds
       <StripeCheckout
          token={({id}) => doRequest({token: id})}
          stripeKey="pk_test_51Ie8k1FSBVGYdrRrGL1gdRlGI3wVCD8tukPvl9uNEU6lFqLf3mRNoYBHC6CknKB5or7rJUvwz1tOysoMLq3geutP00YAY2s3Gb"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
        {errors}
      </div>

    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  //console.log(data);
  return { order: data };
}

export default OrderShow;